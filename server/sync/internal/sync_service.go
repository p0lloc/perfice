package internal

import (
	"context"
	"errors"
	"fmt"
	"log"
	"maps"
	"slices"
	"sort"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

var createOperation string = "create"
var putOperation string = "put"
var deleteOperation string = "delete"
var fullSyncOperation string = "fullSync"

type SyncService struct {
	client                 *mongo.Client
	entityCollections      map[string]*mongo.Collection
	syncUpdateCollection   *SyncUpdateCollection
	keyVerificationService *KeyVerificationService
	authClient             pb.UserServiceClient
}

func NewSyncService(client *mongo.Client, collections map[string]*mongo.Collection,
	syncUpdateCollection *SyncUpdateCollection, keyVerificationService *KeyVerificationService, authClient pb.UserServiceClient) *SyncService {
	return &SyncService{client, collections, syncUpdateCollection, keyVerificationService, authClient}
}

func (s *SyncService) Push(updates []IncomingSyncUpdate, userId string, sessionId string) ([]string, error) {
	sessions, err := s.authClient.GetSessions(context.Background(), &pb.GetSessionsRequest{UserId: userId})
	if err != nil {
		return nil, err
	}

	otherSessions := util.SliceMap(
		util.SliceFilter(sessions.Sessions, func(session *pb.Session) bool { return session.Id != sessionId }),
		func(session *pb.Session) string { return session.Id })

	if len(otherSessions) == 0 {
		// There are no other sessions to sync to
		return nil, nil
	}

	// Sort updates by timestamp
	sort.SliceStable(updates, func(i, j int) bool { return updates[i].Timestamp < updates[j].Timestamp })

	var ackIDs = make([]string, 0)
	for _, update := range updates {
		collection := util.GetFromMapOrNil(s.entityCollections, update.EntityType)
		if collection == nil {
			fmt.Println("Failed to find collection for entity type", update.EntityType)
			continue
		}

		session, err := s.client.StartSession()
		if err != nil {
			return nil, err
		}

		_, err = session.WithTransaction(context.Background(), func(sessionContext mongo.SessionContext) (any, error) {
			err := s.processUpdate(*collection, sessionContext, update, userId)
			if err != nil {
				return nil, err
			}

			if update.Operation == fullSyncOperation {
				// Any previous updates are redundant since we are full syncing
				err = s.syncUpdateCollection.DeleteUpdatesByEntityType(sessionContext, userId, update.EntityType)
				if err != nil {
					return nil, err
				}
			}

			err = s.syncUpdateCollection.Insert(sessionContext, SyncUpdate{
				ID:         update.ID,
				User:       userId,
				Operation:  update.Operation,
				EntityType: update.EntityType,
				Timestamp:  update.Timestamp,
				Clients:    otherSessions,
				Entities:   update.Entities,
			})

			return nil, err
		})

		if err != nil {
			log.Println("Failed to process update:", err)
			continue
		}

		ackIDs = append(ackIDs, update.ID)
	}

	return ackIDs, nil
}

func (s *SyncService) processUpdate(collection *mongo.Collection, sessionContext mongo.SessionContext, update IncomingSyncUpdate, userId string) error {
	var models []mongo.WriteModel

	if update.Operation == fullSyncOperation {
		// Clear the collection of previous data
		models = append(models, mongo.NewDeleteManyModel().SetFilter(bson.M{
			"user": userId,
		}))
	}

	for _, entity := range update.Entities {
		if entity.Data == nil && update.Operation != deleteOperation {
			return errors.New("entity data is nil")
		}

		switch update.Operation {
		case createOperation, putOperation, fullSyncOperation:
			updateModel := mongo.NewUpdateOneModel().
				SetFilter(bson.M{"id": entity.ID, "user": userId}).
				SetUpdate(bson.M{
					"$set": Entity{
						ID:      entity.ID,
						User:    userId,
						Version: entity.Version,
						Data:    entity.Data,
					},
				}).
				SetUpsert(true)

			models = append(models, updateModel)
		case deleteOperation:
			deleteModel := mongo.NewDeleteOneModel().
				SetFilter(bson.M{"id": entity.ID, "user": userId})
			models = append(models, deleteModel)
		}
	}

	if len(models) == 0 {
		return nil
	}

	_, err := collection.BulkWrite(sessionContext, models)
	return err
}

func (s *SyncService) Pull(userId string, sessionId string) ([]SyncUpdate, []byte, error) {
	updates, err := s.syncUpdateCollection.FindBySessionId(sessionId)
	if err != nil {
		return nil, nil, err
	}

	key, err := s.keyVerificationService.GetKeyByUser(userId)
	if err != nil {
		return nil, nil, err
	}

	if key == nil {
		return nil, nil, nil
	}

	return updates, key, nil
}

func (s *SyncService) Ack(sessionId string, updates []string) error {
	_, err := s.syncUpdateCollection.PullSessionFromUpdatesWithIds(updates, sessionId)
	return err
}

func (s *SyncService) FullPull(userId string, sessionId string, entityTypes []string) (map[string][]Entity, error) {
	if entityTypes == nil {
		// If no entity types are provided, sync all entity types
		entityTypes = s.getSupportedEntityTypes()
	}

	result := map[string][]Entity{}
	for _, entityType := range entityTypes {
		collection := util.GetFromMapOrNil(s.entityCollections, entityType)
		if collection == nil {
			return nil, fmt.Errorf("entity type %s not found", entityType)
		}

		cursor, err := (*collection).Find(context.Background(), bson.M{"user": userId})
		if err != nil {
			return nil, err
		}

		var entities = make([]Entity, 0)
		if err := cursor.All(context.Background(), &entities); err != nil {
			return nil, err
		}

		result[entityType] = entities
	}

	// Session has fully synced this entity type, they don't need to know about these updates
	_, err := s.syncUpdateCollection.PullSessionFromUpdatesWithEntityTypes(entityTypes, sessionId)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *SyncService) getSupportedEntityTypes() []string {
	return slices.Collect(maps.Keys(s.entityCollections))
}

func (s *SyncService) OnUserDeleted(userId string) error {
	for _, collection := range s.entityCollections {
		_, err := collection.DeleteMany(context.Background(), bson.M{"user": userId})
		if err != nil {
			return err
		}
	}

	return s.syncUpdateCollection.DeleteUpdatesByUser(userId)
}

package internal

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/mongoutil"
)

type SyncUpdateCollection struct {
	collection *mongo.Collection
}

func NewSyncUpdateCollection(collection *mongo.Collection) *SyncUpdateCollection {
	return &SyncUpdateCollection{collection}
}

func (c *SyncUpdateCollection) Insert(context context.Context, update SyncUpdate) error {
	_, err := c.collection.InsertOne(context, update)
	return err
}

func (c *SyncUpdateCollection) GetUpdatesByIds(ids []string) ([]SyncUpdate, error) {
	if len(ids) < 1 {
		return []SyncUpdate{}, nil
	}

	return mongoutil.Find[SyncUpdate](c.collection, bson.M{"id": bson.M{"$in": ids}})
}

func (c *SyncUpdateCollection) FindBySessionId(sessionId string) ([]SyncUpdate, error) {
	return mongoutil.Find[SyncUpdate](c.collection, bson.M{"clients": sessionId})
}

func (c *SyncUpdateCollection) PullSessionFromUpdatesWithIds(updateIds []string, sessionId string) (bool, error) {
	if len(updateIds) < 1 {
		return false, nil
	}

	rs, err := c.collection.UpdateMany(context.Background(),
		bson.M{"id": bson.M{"$in": updateIds}},
		bson.M{"$pull": bson.M{"clients": sessionId}})

	if err != nil {
		return false, err
	}

	return rs.ModifiedCount > 0, err
}

func (c *SyncUpdateCollection) PullSessionFromUpdatesWithEntityTypes(entityTypes []string, sessionId string) (bool, error) {
	if len(entityTypes) < 1 {
		return false, nil
	}

	rs, err := c.collection.UpdateMany(context.Background(),
		bson.M{"entityType": bson.M{"$in": entityTypes}},
		bson.M{"$pull": bson.M{"clients": sessionId}})

	if err != nil {
		return false, err
	}

	return rs.ModifiedCount > 0, err
}

func (c *SyncUpdateCollection) DeleteUpdatesByEntityType(sessionContext mongo.SessionContext, userId string, entityType string) error {
	_, err := c.collection.DeleteMany(sessionContext, bson.M{"entityType": entityType, "user": userId})
	return err
}

func (c *SyncUpdateCollection) DeleteUpdatesByUser(id string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"user": id})
	return err
}

type KeyVerificationCollection struct {
	collection *mongo.Collection
}

func NewKeyVerificationCollection(collection *mongo.Collection) *KeyVerificationCollection {
	return &KeyVerificationCollection{collection}
}

func (c *KeyVerificationCollection) Upsert(verification KeyVerification) error {
	return mongoutil.Upsert(c.collection, bson.M{"user": verification.User}, verification)
}

func (c *KeyVerificationCollection) FindByUser(user string) (*KeyVerification, error) {
	return mongoutil.FindOne[KeyVerification](c.collection, bson.M{"user": user})
}

func (c *KeyVerificationCollection) DeleteByUser(id string) error {
	_, err := c.collection.DeleteOne(context.Background(), bson.M{"user": id})
	return err
}

type SaltCollection struct {
	collection *mongo.Collection
}

func NewSaltCollection(collection *mongo.Collection) *SaltCollection {
	return &SaltCollection{collection}
}

func (c *SaltCollection) Insert(salt Salt) error {
	_, err := c.collection.InsertOne(context.Background(), salt)
	return err
}

func (c *SaltCollection) FindByUser(user string) (*Salt, error) {
	return mongoutil.FindOne[Salt](c.collection, bson.M{"user": user})
}

func (c *SaltCollection) DeleteByUser(id string) error {
	_, err := c.collection.DeleteOne(context.Background(), bson.M{"user": id})
	return err
}

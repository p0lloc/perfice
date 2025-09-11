package service

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
)

type IntegrationUpdateService struct {
	collection *collection.IntegrationUpdateCollection
}

func NewIntegrationUpdateService(collection *collection.IntegrationUpdateCollection) *IntegrationUpdateService {
	return &IntegrationUpdateService{collection}
}

func (s *IntegrationUpdateService) Insert(update model.IntegrationUpdate) error {
	return s.collection.Insert(update)
}

func (s *IntegrationUpdateService) Update(update model.IntegrationUpdate) (bool, error) {
	return s.collection.Update(update)
}

func (s *IntegrationUpdateService) GetUpdateByIntegrationIdAndIdentifier(integrationId string, identifier string) (*model.IntegrationUpdate, error) {
	return s.collection.FindUpdateByIntegrationIdAndIdentifier(integrationId, identifier)
}

func (s *IntegrationUpdateService) GetUpdatesByUserId(userId string) ([]model.IntegrationUpdate, error) {
	return s.collection.FindUpdatesByUserId(userId)
}

func (s *IntegrationUpdateService) AcknowledgeUpdates(updateIds []primitive.ObjectID, userId string) error {
	return s.collection.DeleteUpdatesByIdsAndUserId(updateIds, userId)
}

func (s *IntegrationUpdateService) OnUserDeleted(id string) error {
	return s.collection.DeleteUpdatesByUserId(id)
}

func (s *IntegrationUpdateService) OnIntegrationDeleted(integrationId string) error {
	return s.collection.DeleteUpdatesByIntegrationId(integrationId)
}

package service

import (
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
)

type IntegrationTypeService struct {
	integrationTypeCollection   *collection.IntegrationTypeCollection
	integrationEntityCollection *collection.IntegrationEntityCollection

	integrationTypes    []model.IntegrationTypeDefinition
	integrationEntities map[string][]model.IntegrationEntityDefinition
}

func NewIntegrationTypeService(integrationTypeCollection *collection.IntegrationTypeCollection, integrationEntityCollection *collection.IntegrationEntityCollection) *IntegrationTypeService {
	return &IntegrationTypeService{integrationTypeCollection, integrationEntityCollection, nil, nil}
}

func (s *IntegrationTypeService) GetIntegrationEntities() map[string][]model.IntegrationEntityDefinition {
	return s.integrationEntities
}

func (s *IntegrationTypeService) Load() error {
	integrationTypes, err := s.integrationTypeCollection.FindIntegrationTypes()
	if err != nil {
		return err
	}

	s.integrationTypes = integrationTypes
	entities := map[string][]model.IntegrationEntityDefinition{}
	fetchedEntities, err := s.integrationEntityCollection.FindIntegrationEntities()
	if err != nil {
		return err
	}

	for _, entity := range fetchedEntities {
		if _, ok := entities[entity.IntegrationType]; ok {
			entities[entity.IntegrationType] = append(entities[entity.IntegrationType], entity)
		} else {
			entities[entity.IntegrationType] = []model.IntegrationEntityDefinition{entity}
		}
	}

	s.integrationEntities = entities
	return nil
}

func (s *IntegrationTypeService) GetIntegrationTypes() []model.IntegrationTypeDefinition {
	return s.integrationTypes
}

func (s *IntegrationTypeService) GetIntegrationType(integrationType string) *model.IntegrationTypeDefinition {
	for _, definition := range s.integrationTypes {
		if definition.IntegrationType == integrationType {
			return &definition
		}
	}
	return nil
}

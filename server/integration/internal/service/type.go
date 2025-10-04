package service

import (
	"fmt"

	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/util"
)

type IntegrationTypeService struct {
	integrationTypeCollection   *collection.IntegrationTypeCollection
	integrationEntityCollection *collection.IntegrationEntityCollection

	integrationTypes    []model.IntegrationTypeDefinition
	integrationEntities map[string][]model.IntegrationEntityDefinition
	entitySourceMapping map[string][]any
	typeMapping         map[string]model.IntegrationEntityDefinition
}

func constructIntegrationEntityKey(integrationType string, entityType string) string {
	return fmt.Sprintf("%s:%s", integrationType, entityType)
}

func NewIntegrationTypeService(integrationTypeCollection *collection.IntegrationTypeCollection, integrationEntityCollection *collection.IntegrationEntityCollection) *IntegrationTypeService {
	return &IntegrationTypeService{integrationTypeCollection: integrationTypeCollection,
		integrationEntityCollection: integrationEntityCollection, typeMapping: map[string]model.IntegrationEntityDefinition{},
		entitySourceMapping: map[string][]any{},
	}
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

		key := constructIntegrationEntityKey(entity.IntegrationType, entity.EntityType)
		s.typeMapping[key] = entity
		deserializedSources := make([]any, 0)
		for _, source := range entity.Sources {
			deserializedSources = append(deserializedSources, s.deserializeEntitySourceSettings(source))
		}

		s.entitySourceMapping[key] = deserializedSources
	}

	s.integrationEntities = entities
	return nil
}

func (s *IntegrationTypeService) GetIntegrationEntityByIntegrationTypeAndEntityType(integrationType string, entityType string) *model.IntegrationEntityDefinition {
	key := constructIntegrationEntityKey(integrationType, entityType)
	return util.GetFromMapOrNil(s.typeMapping, key)
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

func (s *IntegrationTypeService) deserializeEntitySourceSettings(source model.IntegrationEntitySource) any {
	switch source.Type {
	case model.PullIntegrationEntitySourceType:
		return model.PullIntegrationEntitySourceSettings{
			URL: source.Settings["url"].(string),
			Interval: model.IntegrationFetchInterval{
				Cron:   source.Settings["interval"].(map[string]any)["cron"].(string),
				Jitter: util.CastToInt(source.Settings["interval"].(map[string]any)["jitter"].(any)),
			},
		}
	case model.PushIntegrationEntitySourceType:
		return model.PushIntegrationEntitySourceSettings{}
	}

	return nil
}

func (s *IntegrationTypeService) GetSourceSettings(integrationType string, entityType string) []any {
	key := constructIntegrationEntityKey(integrationType, entityType)
	val := util.GetFromMapOrNil(s.entitySourceMapping, key)
	if val == nil {
		return nil
	}

	return *val
}
func (s *IntegrationTypeService) ExtractPullSource(integrationType string, entityType string) *model.PullIntegrationEntitySourceSettings {
	sourceSettings := s.GetSourceSettings(integrationType, entityType)
	if sourceSettings == nil {
		return nil
	}

	return FindGenericInSlice[model.PullIntegrationEntitySourceSettings](sourceSettings)
}

func (s *IntegrationTypeService) ExtractPushSource(integrationType string, entityType string) *model.PushIntegrationEntitySourceSettings {
	sourceSettings := s.GetSourceSettings(integrationType, entityType)
	if sourceSettings == nil {
		return nil
	}

	pushSource := FindGenericInSlice[model.PushIntegrationEntitySourceSettings](sourceSettings)
	if pushSource == nil {
		return nil
	}

	return pushSource
}

func FindGenericInSlice[T any](slice []any) *T {
	for _, source := range slice {
		if val, ok := source.(T); ok {
			return &val
		}
	}

	return nil
}

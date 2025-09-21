package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/PaesslerAG/gval"
	"github.com/PaesslerAG/jsonpath"
	"github.com/getsentry/sentry-go"
	"github.com/kaptinlin/jsonschema"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
	"perfice.adoe.dev/util"
)

type IntegrationProcessService struct {
	updateService              *IntegrationUpdateService
	fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection
	schemas                    map[string]jsonschema.Schema

	pathAggregators   map[string]AggregatePath
	variableEvaluator IntegrationVariableEvaluator
}

func NewIntegrationProcessService(updatesCollection *IntegrationUpdateService, fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection) *IntegrationProcessService {
	return &IntegrationProcessService{updateService: updatesCollection, fetchedEntityLogCollection: fetchedEntityLogCollection,
		schemas: map[string]jsonschema.Schema{}, pathAggregators: defaultPathAggregators, variableEvaluator: NewIntegrationVariableEvaluator()}
}

func (s *IntegrationProcessService) handleIntegrationResponse(definition model.IntegrationEntityDefinition, integration model.UserIntegration, body []byte, now time.Time) error {
	var data interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return fmt.Errorf("failed to parse JSON: %v", err)
	}

	schema, err := s.getSchema(definition)
	if err != nil {
		return err
	}

	result := schema.Validate(data)
	if !result.IsValid() {
		return nil
	}

	if definition.Multiple != "" {
		items, err := jsonpath.Get(definition.Multiple, data)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to get items in multiple keypath: %v\n", err))
			return nil
		}

		if definition.LogSettings != nil {
			err := s.handleIntegrationLog(definition, integration, now, data, items.([]any))
			if err != nil {
				return err
			}
		}

		for _, item := range items.([]interface{}) {
			if err := s.handleItem(definition, integration, item, now); err != nil {
				return err
			}
		}
	} else {
		if err := s.handleItem(definition, integration, data, now); err != nil {
			return err
		}
	}

	return nil
}

var expressionFunctions = []gval.Language{
	jsonpath.PlaceholderExtension(),
}

var builder = gval.Full(expressionFunctions...)

func (s *IntegrationProcessService) extractField(path any, data interface{}, now time.Time) (any, error) {
	switch path := path.(type) {
	case string:
		gPath, err := builder.NewEvaluable(path)
		if err != nil {
			return nil, err
		}

		value, err := gPath(context.Background(), data)
		if err != nil {
			return nil, nil
		}

		return value, nil
	case map[string]interface{}:
		// Handle operations
		for op, args := range path {
			if len(op) < 2 {
				// Must start with $ followed by a valid aggregator
				continue
			}

			if agg, ok := s.pathAggregators[op[1:]]; ok {
				value, err := agg.Evaluate(args, data, now)
				if err != nil {
					return nil, err
				}

				return value, nil
			} else {
				sentry.CaptureException(fmt.Errorf("unknown aggregator: %s", op[1:]))
			}

			// Only handle the first operation in the object
			break
		}
	}

	return nil, nil
}

func (s *IntegrationProcessService) extractTimestamp(def model.IntegrationEntityDefinition, data interface{}, now time.Time) (int64, error) {
	extracted, err := s.extractField(mongoutil.CleanBSON(def.Timestamp), data, now)
	if err != nil {
		return 0, err
	}

	if extracted == nil {
		return 0, errors.New("unable to extract timestamp")
	}

	switch extracted := extracted.(type) {
	case int64:
		return extracted, nil
	case float64:
		return int64(extracted), nil
	}

	return 0, nil
}

func (s *IntegrationProcessService) handleItem(def model.IntegrationEntityDefinition, integration model.UserIntegration, data interface{}, now time.Time) error {
	options := s.mapOptions(def.Options, integration.Options)
	identifier, err := s.variableEvaluator.evaluateIdentifier(def.Identifier, options, data, now)
	if err != nil {
		return err
	}

	timestamp, err := s.extractTimestamp(def, data, now)
	if err != nil {
		sentry.CaptureException(fmt.Errorf("Failed to extract timestamp: %v\n", err))
		timestamp = now.UnixMilli()
	}

	// Extract fields
	extractedData := make(map[string]interface{})
	for remoteField, questionId := range integration.Fields {
		// Get the field path from the definition

		fieldPath, exists := def.Fields[remoteField]
		if !exists {
			sentry.CaptureException(fmt.Errorf("Field %s not found in definition\n", remoteField))
			continue
		}

		// Convert bson documents to map
		path := mongoutil.CleanBSON(fieldPath.Path)

		value, err := s.extractField(path, data, now)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to get field %v: %v\n", &fieldPath.Path, err))
			continue
		}

		if value == nil {
			return nil
		}

		extractedData[questionId] = value
	}

	existingUpdate, err := s.updateService.GetUpdateByIntegrationIdAndIdentifier(integration.Id, identifier)
	if err != nil {
		return err
	}
	if existingUpdate != nil {
		existingUpdate.Data = extractedData
		existingUpdate.Timestamp = timestamp

		_, err = s.updateService.Update(*existingUpdate)
		if err != nil {
			return err
		}
	} else {
		update := model.IntegrationUpdate{
			ID:            primitive.NewObjectID(),
			UserId:        integration.UserId,
			IntegrationId: integration.Id,
			Identifier:    identifier,
			Data:          extractedData,
			Timestamp:     timestamp,
		}

		err = s.updateService.Insert(update)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *IntegrationProcessService) mapOptions(defined map[string]model.IntegrationOption, options map[string]any) map[string]string {
	mapped := map[string]string{}
	for key := range defined {
		if val, ok := options[key]; ok {
			mapped[key] = fmt.Sprintf("%v", val)
		}
	}

	return mapped
}

func (s *IntegrationProcessService) handleIntegrationLog(definition model.IntegrationEntityDefinition, integration model.UserIntegration, now time.Time, data any, items []any) error {
	options := s.mapOptions(definition.Options, integration.Options)
	logIdentifier, err := s.variableEvaluator.evaluateIdentifier(definition.LogSettings.Identifier, options, data, now)
	if err != nil {
		return err
	}

	logged, err := s.fetchedEntityLogCollection.FindByIntegrationIdAndIdentifier(integration.Id, logIdentifier)
	if err != nil {
		return err
	}

	nowIds, err := util.SliceMapErr[any, string](items, func(item any) (string, error) {
		return s.variableEvaluator.evaluateIdentifier(definition.Identifier, options, item, now)
	})

	if logged == nil {
		err := s.fetchedEntityLogCollection.Insert(model.FetchedEntityLog{
			Identifier:    logIdentifier,
			EntityIds:     nowIds,
			IntegrationId: integration.Id,
		})
		if err != nil {
			return err
		}
		return nil
	}

	previousIds := logged.EntityIds

	removed := make([]string, 0)
	added := make([]string, 0)
	for _, id := range previousIds {
		contains := util.SliceContains(nowIds, id)
		if !contains {
			removed = append(removed, id)
		}
	}

	for _, id := range nowIds {
		contains := util.SliceContains(previousIds, id)
		if !contains {
			added = append(added, id)
		}
	}

	if len(removed) > 0 {
		err := s.fetchedEntityLogCollection.RemoveEntities(integration.Id, logIdentifier, removed)
		if err != nil {
			return err
		}

		for _, removedId := range removed {
			existingUpdate, err := s.updateService.GetUpdateByIntegrationIdAndIdentifier(integration.Id, removedId)
			if err != nil {
				return err
			}

			if existingUpdate != nil {
				existingUpdate.Data = nil
				_, err = s.updateService.Update(*existingUpdate)
				if err != nil {
					return err
				}
			} else {
				update := model.IntegrationUpdate{
					ID:            primitive.NewObjectID(),
					UserId:        integration.UserId,
					IntegrationId: integration.Id,
					Identifier:    removedId,
					Data:          nil,
					Timestamp:     time.Now().UnixMilli(),
				}

				err = s.updateService.Insert(update)
				if err != nil {
					return err
				}
			}
		}
	}

	if len(added) > 0 {
		err := s.fetchedEntityLogCollection.AddEntities(integration.Id, logIdentifier, added)
		if err != nil {
			return err
		}

	}

	return nil
}

func (s *IntegrationProcessService) getSchema(definition model.IntegrationEntityDefinition) (jsonschema.Schema, error) {
	key := constructIntegrationEntityKey(definition.IntegrationType, definition.EntityType)
	if cachedSchema, ok := s.schemas[key]; ok {
		return cachedSchema, nil
	}

	bytes, err := json.Marshal(definition.Schema)
	if err != nil {
		return jsonschema.Schema{}, fmt.Errorf("unable to marshal schema")
	}

	// Validate schema
	compiler := jsonschema.NewCompiler()
	schema, err := compiler.Compile(bytes)
	if err != nil {
		return jsonschema.Schema{}, fmt.Errorf("failed to compile schema: %v", err)
	}

	s.schemas[key] = *schema
	return *schema, nil
}

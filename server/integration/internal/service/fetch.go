package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PaesslerAG/gval"
	"github.com/PaesslerAG/jsonpath"
	"github.com/getsentry/sentry-go"
	"github.com/kaptinlin/jsonschema"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/oauth2"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

var maxTokenRefreshTries = 3
var historicalFetchDays = 15

type IntegrationFetchService struct {
	userIntegrationService     *UserIntegrationService
	typeService                *IntegrationTypeService
	authenticationService      *IntegrationAuthenticationService
	updateService              *IntegrationUpdateService
	fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection
	userService                pb.UserServiceClient
	typeMapping                map[string]model.IntegrationEntityDefinition
	schemas                    map[string]jsonschema.Schema

	tokenRefreshTries map[string]int

	pathAggregators map[string]AggregatePath
	variables       map[string]VariableLookup
}

type VariableLookup func(now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error)

var defaultVariableLookups = map[string]VariableLookup{
	"DATE": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.Format("2006-01-02"), nil
	},
	"DATE_TIME": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.Format(time.RFC3339), nil
	},
	"DATE_TIME_MIDNIGHT": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Format(time.RFC3339), nil
	},
	"DATE_TIME_TOMORROW_MIDNIGHT": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location()).Format(time.RFC3339), nil
	},
	"DATE_TOMORROW": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.AddDate(0, 0, 1).Format("2006-01-02"), nil
	},
	"START": func(now time.Time, rangeStart time.Time, _ time.Time) (string, error) {
		return rangeStart.Format("2006-01-02"), nil
	},
	"END": func(now time.Time, _ time.Time, rangeEnd time.Time) (string, error) {
		return rangeEnd.Format("2006-01-02"), nil
	},
}

var defaultPathAggregators = map[string]AggregatePath{
	"sum":             &SumAggregatePath{},
	"mean":            &MeanAggregatePath{},
	"div":             &DivAggregatePath{},
	"date":            &DateAggregatePath{},
	"date_time":       &DateTimeAggregatePath{},
	"date_time_notz":  &DateTimeNoTZAggregatePath{},
	"date_time_merge": &DateTimeMergeAggregatePath{},
	"current_time":    &CurrentTimePath{},
}

func NewIntegrationFetchService(userIntegrationService *UserIntegrationService, typeService *IntegrationTypeService,
	authenticationService *IntegrationAuthenticationService, updatesCollection *IntegrationUpdateService, fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection, userService pb.UserServiceClient) *IntegrationFetchService {

	return &IntegrationFetchService{userIntegrationService: userIntegrationService, typeService: typeService,
		authenticationService: authenticationService, updateService: updatesCollection, fetchedEntityLogCollection: fetchedEntityLogCollection, userService: userService,
		typeMapping: map[string]model.IntegrationEntityDefinition{}, schemas: map[string]jsonschema.Schema{}, tokenRefreshTries: map[string]int{},
		pathAggregators: defaultPathAggregators, variables: defaultVariableLookups}
}

func (s *IntegrationFetchService) replaceURLVariables(inputUrl string, options map[string]string, now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error) {
	availableVariables := map[string]VariableLookup{}
	for varName, lookup := range s.variables {
		availableVariables[varName] = lookup
	}

	for varName, value := range options {
		availableVariables[varName] = func(now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error) {
			return value, nil
		}
	}

	result := inputUrl
	for varName, lookup := range availableVariables {
		varName = fmt.Sprintf("[%s]", varName)
		if strings.Contains(result, varName) {
			val, err := lookup(now, rangeStart, rangeEnd)
			if err != nil {
				return "", fmt.Errorf("failed to evaluate variable %s: %v", varName, err)
			}

			result = strings.ReplaceAll(result, varName, url.QueryEscape(val))
		}
	}

	return result, nil
}

func (s *IntegrationFetchService) constructIntegrationEntityKey(integrationType string, entityType string) string {
	return fmt.Sprintf("%s:%s", integrationType, entityType)
}

func (s *IntegrationFetchService) getUserTimeZone(userId string) (*time.Location, error) {
	timeZoneResponse, err := s.userService.GetUserTimeZone(context.Background(), &pb.GetUserTimeZoneRequest{UserId: userId})
	if err != nil {
		return nil, fmt.Errorf("failed to get user timezone: %v", err)
	}

	return time.LoadLocation(timeZoneResponse.Timezone)
}

func (s *IntegrationFetchService) makeRequest(integration model.UserIntegration, reqUrl string) ([]byte, error) {

	integrationType := s.typeService.GetIntegrationType(integration.IntegrationType)
	if integrationType == nil {
		return nil, fmt.Errorf("integration type %s not found", integration.IntegrationType)
	}

	var client *http.Client
	if integrationType.Authentication != nil {
		credentials, err := s.authenticationService.GetCredentialsByUserIdAndIntegrationType(integration.UserId, integration.IntegrationType)
		if err != nil {
			return nil, err
		}

		if credentials == nil {
			fmt.Printf("No credentials found for user %s and integration type %s\n", integration.UserId, integration.IntegrationType)
			return nil, nil
		}

		method := s.authenticationService.GetAuthenticationMethod(integration.IntegrationType)
		if method == nil {
			return nil, nil
		}

		client, err = method.CreateClient(*credentials)
		if err != nil {
			return nil, err
		}
	} else {
		client = http.DefaultClient
	}

	req, err := http.NewRequest("GET", reqUrl, nil)
	resp, err := client.Do(req)
	if err != nil {
		var val *oauth2.RetrieveError
		if errors.As(err, &val) {
			tries := util.GetFromMapOrDefault(s.tokenRefreshTries, integration.UserId, 0)
			log.Printf("Token expired and refresh failed: %s:%s (%s)\n", integration.UserId, integration.IntegrationType, val.Error())
			if *tries >= maxTokenRefreshTries {
				log.Printf("Max token refresh tries reached: %s:%s, deleting credentials\n", integration.UserId, integration.IntegrationType)
				if err := s.authenticationService.DeleteCredentials(integration.UserId, integration.IntegrationType); err != nil {
					return nil, err
				}

			}

			s.tokenRefreshTries[integration.UserId] = *tries + 1
			return nil, nil
		}
		return nil, err
	}

	delete(s.tokenRefreshTries, integration.UserId)

	if resp == nil {
		return nil, nil
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return body, nil
}

type IntegrationFetchError struct {
	error error
}

func (i IntegrationFetchError) Error() string {
	return fmt.Sprintf("Failed to fetch integration: %v", i.error)
}

func (s *IntegrationFetchService) mapOptions(defined map[string]model.IntegrationOption, options map[string]any) map[string]string {
	mapped := map[string]string{}
	for key := range defined {
		if val, ok := options[key]; ok {
			mapped[key] = fmt.Sprintf("%v", val)
		}
	}

	return mapped
}

func (s *IntegrationFetchService) processIntegration(integration model.UserIntegration) error {
	timeZone, err := s.getUserTimeZone(integration.UserId)
	if err != nil {
		return err
	}

	now := time.Now().In(timeZone)
	definition := util.GetFromMapOrNil(s.typeMapping, s.constructIntegrationEntityKey(integration.IntegrationType, integration.EntityType))
	if definition == nil {
		return nil
	}

	options := s.mapOptions(definition.Options, integration.Options)

	reqUrl, err := s.replaceURLVariables(definition.URL, options, now, now, now)
	if err != nil {
		return fmt.Errorf("failed to replace variables in URL: %v", err)
	}

	body, err := s.makeRequest(integration, reqUrl)
	if err != nil {
		return IntegrationFetchError{err}
	}

	if body == nil {
		return IntegrationFetchError{err}
	}

	return s.handleIntegrationResponse(*definition, integration, body, now)
}

func (s *IntegrationFetchService) handleIntegrationLog(definition model.IntegrationEntityDefinition, integration model.UserIntegration, now time.Time, data any, items []any) error {
	options := s.mapOptions(definition.Options, integration.Options)
	logIdentifier, err := s.evaluateIdentifier(definition.LogSettings.Identifier, options, data, now)
	if err != nil {
		return err
	}

	logged, err := s.fetchedEntityLogCollection.FindByIntegrationIdAndIdentifier(integration.Id, logIdentifier)
	if err != nil {
		return err
	}

	nowIds, err := util.SliceMapErr[any, string](items, func(item any) (string, error) {
		return s.evaluateIdentifier(definition.Identifier, options, item, now)
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

func (s *IntegrationFetchService) getSchema(definition model.IntegrationEntityDefinition) (jsonschema.Schema, error) {
	key := s.constructIntegrationEntityKey(definition.IntegrationType, definition.EntityType)
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

func (s *IntegrationFetchService) handleIntegrationResponse(definition model.IntegrationEntityDefinition, integration model.UserIntegration, body []byte, now time.Time) error {
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

func (s *IntegrationFetchService) Load() {
	integrationTypes := s.typeService.GetIntegrationEntities()

	typeMapping := map[string]model.IntegrationEntityDefinition{}
	for key, entities := range integrationTypes {
		for _, entity := range entities {
			typeMapping[s.constructIntegrationEntityKey(key, entity.EntityType)] = entity
		}
	}

	s.typeMapping = typeMapping
}

func (s *IntegrationFetchService) FetchHistorical(integration model.UserIntegration) error {
	timeZone, err := s.getUserTimeZone(integration.UserId)
	if err != nil {
		return err
	}

	now := time.Now().In(timeZone)
	start := now.AddDate(0, 0, -historicalFetchDays)

	definition := util.GetFromMapOrNil(s.typeMapping, s.constructIntegrationEntityKey(integration.IntegrationType, integration.EntityType))
	if definition == nil {
		return nil
	}

	if definition.History == nil {
		return errors.New("integration definition does not support history")
	}

	options := s.mapOptions(definition.Options, integration.Options)

	reqUrl, err := s.replaceURLVariables(definition.History.URL, options, now, start, now)
	if err != nil {
		return fmt.Errorf("failed to replace variables in URL: %v", err)
	}

	body, err := s.makeRequest(integration, reqUrl)
	if err != nil {
		return err
	}

	if body == nil {
		return nil
	}

	return s.handleIntegrationResponse(*definition, integration, body, now)
}

func (s *IntegrationFetchService) extractTimestamp(def model.IntegrationEntityDefinition, data interface{}, now time.Time) (int64, error) {
	extracted, err := s.extractField(mongoutil.CleanBSON(def.Timestamp), data, now)
	if err != nil {
		return 0, err
	}

	switch extracted := extracted.(type) {
	case int64:
		return extracted, nil
	case float64:
		return int64(extracted), nil
	}

	return 0, nil
}

var expressionFunctions = []gval.Language{
	jsonpath.PlaceholderExtension(),
}

var builder = gval.Full(expressionFunctions...)

func (s *IntegrationFetchService) extractField(path any, data interface{}, now time.Time) (any, error) {
	switch path := path.(type) {
	case string:
		gPath, err := builder.NewEvaluable(path)
		if err != nil {
			return nil, err
		}

		value, err := gPath(context.Background(), data)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to get field %s: %v\n", path, err))
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

func (s *IntegrationFetchService) evaluateIdentifier(identifier string, options map[string]string, data interface{}, now time.Time) (string, error) {

	identifier, err := s.replaceURLVariables(identifier, options, now, now, now)
	if err != nil {
		return "", err
	}

	if strings.HasPrefix(identifier, "$") {
		identifierValue, err := jsonpath.Get(identifier, data)
		if err != nil {
			return "", fmt.Errorf("failed to evaluate identifier JSONPath: %v", err)
		}

		if floatValue, ok := identifierValue.(float64); ok {
			identifier = strconv.FormatFloat(floatValue, 'f', -1, 64)
		} else {
			identifier = fmt.Sprintf("%v", identifierValue)
		}
	}

	return identifier, nil
}

func (s *IntegrationFetchService) handleItem(def model.IntegrationEntityDefinition, integration model.UserIntegration, data interface{}, now time.Time) error {
	options := s.mapOptions(def.Options, integration.Options)
	identifier, err := s.evaluateIdentifier(def.Identifier, options, data, now)
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

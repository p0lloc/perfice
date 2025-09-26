package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/kaptinlin/jsonschema"
	"golang.org/x/oauth2"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
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
	process                    *IntegrationProcessService
	fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection
	userService                pb.UserServiceClient
	schemas                    map[string]jsonschema.Schema

	tokenRefreshTries map[string]int

	pathAggregators   map[string]AggregatePath
	variableEvaluator IntegrationVariableEvaluator
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

func NewIntegrationFetchService(processService *IntegrationProcessService, userIntegrationService *UserIntegrationService, typeService *IntegrationTypeService,
	authenticationService *IntegrationAuthenticationService, updatesCollection *IntegrationUpdateService, fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection, userService pb.UserServiceClient) *IntegrationFetchService {

	return &IntegrationFetchService{userIntegrationService: userIntegrationService, typeService: typeService,
		authenticationService: authenticationService, updateService: updatesCollection, fetchedEntityLogCollection: fetchedEntityLogCollection, userService: userService,
		schemas: map[string]jsonschema.Schema{}, tokenRefreshTries: map[string]int{},
		process:         processService,
		pathAggregators: defaultPathAggregators, variableEvaluator: NewIntegrationVariableEvaluator()}
}

func (s *IntegrationFetchService) FetchHistorical(integration model.UserIntegration) error {
	timeZone, err := loadUserTimeZone(s.userService, integration.UserId)
	if err != nil {
		return err
	}

	now := time.Now().In(timeZone)
	start := now.AddDate(0, 0, -historicalFetchDays)

	definition := s.typeService.GetIntegrationEntityByIntegrationTypeAndEntityType(integration.IntegrationType, integration.EntityType)
	if definition == nil {
		return nil
	}

	if definition.History == nil {
		return errors.New("integration definition does not support history")
	}

	options := s.mapOptions(definition.Options, integration.Options)

	reqUrl, err := s.variableEvaluator.replaceURLVariables(definition.History.URL, options, now, start, now)
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

	return s.process.handleIntegrationResponse(*definition, integration, body, now)
}

func loadUserTimeZone(userService pb.UserServiceClient, userId string) (*time.Location, error) {
	timeZoneResponse, err := userService.GetUserTimeZone(context.Background(), &pb.GetUserTimeZoneRequest{UserId: userId})
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

func (s *IntegrationFetchService) pullIntegration(integration model.UserIntegration, pullSource model.PullIntegrationEntitySourceSettings) error {
	timeZone, err := loadUserTimeZone(s.userService, integration.UserId)
	if err != nil {
		return err
	}

	now := time.Now().In(timeZone)
	definition := s.typeService.GetIntegrationEntityByIntegrationTypeAndEntityType(integration.IntegrationType, integration.EntityType)
	if definition == nil {
		return nil
	}

	options := s.mapOptions(definition.Options, integration.Options)

	reqUrl, err := s.variableEvaluator.replaceURLVariables(pullSource.URL, options, now, now, now)
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

	return s.process.handleIntegrationResponse(*definition, integration, body, now)
}

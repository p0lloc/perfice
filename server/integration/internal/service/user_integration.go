package service

import (
	"errors"

	"github.com/google/uuid"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

type UserIntegrationService struct {
	userIntegrationCollection  *collection.UserIntegrationCollection
	fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection
	integrationFetchService    *IntegrationFetchService
	userService                pb.UserServiceClient

	integrationCreateCallbacks []func(model.UserIntegration)
	integrationDeleteCallbacks []func(string)
}

func NewUserIntegrationService(userIntegrationCollection *collection.UserIntegrationCollection, fetchedEntityLogCollection *collection.FetchedIntegrationEntityLogCollection,
	userService pb.UserServiceClient) *UserIntegrationService {
	return &UserIntegrationService{
		userIntegrationCollection:  userIntegrationCollection,
		fetchedEntityLogCollection: fetchedEntityLogCollection,
		userService:                userService,
		integrationCreateCallbacks: []func(model.UserIntegration){},
		integrationDeleteCallbacks: []func(string){},
	}
}

func (s *UserIntegrationService) SetFetchService(integrationFetchService *IntegrationFetchService) {
	s.integrationFetchService = integrationFetchService
}

func (s *UserIntegrationService) GetAllIntegrations() ([]model.UserIntegration, error) {
	return s.userIntegrationCollection.FindAllIntegrations()
}

func (s *UserIntegrationService) GetIntegrationsByUserId(userId string) ([]model.UserIntegration, error) {
	return s.userIntegrationCollection.FindIntegrationsByUserId(userId)
}

func (s *UserIntegrationService) Create(userId string, integrationType string, entityType string,
	formId string, fields map[string]string, options map[string]any) (*model.UserIntegration, error) {

	integration := model.UserIntegration{
		Id:              uuid.NewString(),
		UserId:          userId,
		IntegrationType: integrationType,
		EntityType:      entityType,
		FormId:          formId,
		Fields:          fields,
		Options:         options,
	}

	if err := s.userIntegrationCollection.Insert(integration); err != nil {
		return nil, err
	}

	for _, callback := range s.integrationCreateCallbacks {
		callback(integration)
	}

	return &integration, nil
}

func (s *UserIntegrationService) Update(id string, userId string, fields map[string]string, options map[string]any) (*model.UserIntegration, error) {
	integration, err := s.userIntegrationCollection.FindIntegrationByIdAndUserId(id, userId)
	if err != nil {
		return nil, err
	}

	if integration == nil {
		return nil, nil
	}

	integration.Fields = fields
	integration.Options = options

	if _, err := s.userIntegrationCollection.Update(*integration); err != nil {
		return nil, err
	}

	return integration, nil
}

func (s *UserIntegrationService) Delete(id string, userId string) error {
	success, err := s.userIntegrationCollection.DeleteByIdAndUserId(id, userId)
	if success {
		for _, callback := range s.integrationDeleteCallbacks {
			callback(id)
		}

		err := s.fetchedEntityLogCollection.DeleteByIntegrationIds([]string{id})
		if err != nil {
			return err
		}
	}

	return err
}

func (s *UserIntegrationService) AddCreateCallback(callback func(model.UserIntegration)) {
	s.integrationCreateCallbacks = append(s.integrationCreateCallbacks, callback)
}

func (s *UserIntegrationService) AddDeleteCallback(callback func(string)) {
	s.integrationDeleteCallbacks = append(s.integrationDeleteCallbacks, callback)
}

func (s *UserIntegrationService) FetchHistorical(integrationId string, userId string) error {
	integration, err := s.userIntegrationCollection.FindIntegrationByIdAndUserId(integrationId, userId)
	if err != nil {
		return err
	}

	if integration == nil {
		return errors.New("integration not found")
	}

	return s.integrationFetchService.FetchHistorical(*integration)
}

func (s *UserIntegrationService) GetIntegrationById(id string) (*model.UserIntegration, error) {
	return s.userIntegrationCollection.FindIntegrationById(id)
}

func (s *UserIntegrationService) OnUserDeleted(id string) error {
	integrations, err := s.userIntegrationCollection.FindIntegrationsByUserId(id)
	if err != nil {
		return err
	}

	err = s.userIntegrationCollection.DeleteByUserId(id)
	if err != nil {
		return err
	}

	for _, integration := range integrations {
		for _, callback := range s.integrationDeleteCallbacks {
			callback(integration.Id)
		}
	}

	integrationIds := util.SliceMap(integrations, func(integration model.UserIntegration) string { return integration.Id })
	err = s.fetchedEntityLogCollection.DeleteByIntegrationIds(integrationIds)
	if err != nil {
		return err
	}

	return nil
}

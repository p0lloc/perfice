package controller

import (
	"slices"

	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/integration/internal/service"
	"perfice.adoe.dev/util"
)

type IntegrationTypeController struct {
	integrationTypeService *service.IntegrationTypeService
	integrationAuthService *service.IntegrationAuthenticationService
}

func NewIntegrationTypeController(integrationTypeService *service.IntegrationTypeService,
	integrationAuthService *service.IntegrationAuthenticationService) *IntegrationTypeController {

	return &IntegrationTypeController{integrationTypeService, integrationAuthService}
}

type IntegrationEntityResponse struct {
	Name       string                             `json:"name"`
	EntityType string                             `json:"entityType"`
	Fields     map[string]string                  `json:"fields"`
	Options    map[string]model.IntegrationOption `json:"options"`
	Historical bool                               `json:"historical"`
}

type IntegrationTypeResponse struct {
	IntegrationType string                      `json:"integrationType"`
	Authenticated   bool                        `json:"authenticated"`
	Name            string                      `json:"name"`
	Logo            string                      `json:"logo"`
	Entities        []IntegrationEntityResponse `json:"entities"`
}

func (c *IntegrationTypeController) GetIntegrationTypes(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	integrationTypes := c.integrationTypeService.GetIntegrationTypes()
	credentials, err := c.integrationAuthService.GetCredentialsByUserId(userId)
	if err != nil {
		return err
	}

	var types = make([]IntegrationTypeResponse, 0)
	for _, definition := range integrationTypes {
		entities := util.GetFromMapOrNil(c.integrationTypeService.GetIntegrationEntities(), definition.IntegrationType)
		if entities == nil {
			continue
		}

		var entityResponses []IntegrationEntityResponse
		for _, entity := range *entities {
			fields := map[string]string{}
			for key, field := range entity.Fields {
				fields[key] = field.Name
			}

			entityResponses = append(entityResponses, IntegrationEntityResponse{
				Name:       entity.Name,
				EntityType: entity.EntityType,
				Fields:     fields,
				Options:    entity.Options,
				Historical: entity.History != nil,
			})
		}

		isAuthenticated := definition.Authentication == nil || slices.IndexFunc(credentials, func(credential model.IntegrationCredentials) bool {
			return credential.IntegrationType == definition.IntegrationType
		}) != -1

		types = append(types, IntegrationTypeResponse{
			IntegrationType: definition.IntegrationType,
			Authenticated:   isAuthenticated,
			Logo:            definition.Logo,
			Name:            definition.Name,
			Entities:        entityResponses,
		})
	}

	return ctx.JSON(types)
}

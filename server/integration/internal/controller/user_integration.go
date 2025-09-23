package controller

import (
	"github.com/getsentry/sentry-go"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/integration/internal/service"
	"perfice.adoe.dev/integration/internal/util"
	util2 "perfice.adoe.dev/util"
)

type UserIntegrationController struct {
	validator              *validator.Validate
	userIntegrationService *service.UserIntegrationService
}

func NewUserIntegrationController(userIntegrationService *service.UserIntegrationService) *UserIntegrationController {
	return &UserIntegrationController{validator.New(validator.WithRequiredStructEnabled()), userIntegrationService}
}

type CreateIntegrationRequest struct {
	IntegrationType string            `json:"integrationType" validate:"required"`
	EntityType      string            `json:"entityType" validate:"required"`
	FormId          string            `json:"formId" validate:"required"`
	Fields          map[string]string `json:"fields" validate:"required"`
	Options         map[string]any    `json:"options" validate:"required"`
}

type UpdateIntegrationRequest struct {
	Fields  map[string]string `json:"fields" validate:"required"`
	Options map[string]any    `json:"options" validate:"required"`
}

type UserIntegrationResponse struct {
	Id              string                        `bson:"id" json:"id"`
	IntegrationType string                        `json:"integrationType"`
	EntityType      string                        `json:"entityType"`
	Webhook         *model.UserIntegrationWebhook `json:"webhook"`
	FormId          string                        `json:"formId"`
	Fields          map[string]string             `json:"fields"`
	Options         map[string]any                `json:"options"`
}

func (c *UserIntegrationController) GetIntegrations(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	integrations, err := c.userIntegrationService.GetIntegrationsByUserId(userId)
	if err != nil {
		return err
	}

	response := util2.SliceMap(integrations, func(integration model.UserIntegration) UserIntegrationResponse {
		return UserIntegrationResponse{
			Id:              integration.Id,
			IntegrationType: integration.IntegrationType,
			EntityType:      integration.EntityType,
			Webhook:         integration.Webhook,
			FormId:          integration.FormId,
			Fields:          integration.Fields,
			Options:         integration.Options,
		}
	})

	return ctx.JSON(response)
}

func (c *UserIntegrationController) Create(ctx *fiber.Ctx) error {
	var request CreateIntegrationRequest
	if err := util.ParseAndValidate(ctx, c.validator, &request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	userId := getUserId(ctx)
	integration, err := c.userIntegrationService.Create(userId, request.IntegrationType, request.EntityType, request.FormId, request.Fields, request.Options)
	if err != nil {
		return err
	}

	return ctx.JSON(*integration)
}

func (c *UserIntegrationController) Update(ctx *fiber.Ctx) error {
	var request UpdateIntegrationRequest
	if err := util.ParseAndValidate(ctx, c.validator, &request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	id := ctx.Params("id")
	userId := getUserId(ctx)
	integration, err := c.userIntegrationService.Update(id, userId, request.Fields, request.Options)
	if err != nil {
		return err
	}

	if integration == nil {
		return ctx.SendStatus(fiber.StatusNotFound)
	}

	return ctx.JSON(integration)
}

func (c *UserIntegrationController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	userId := getUserId(ctx)
	if err := c.userIntegrationService.Delete(id, userId); err != nil {
		sentry.CaptureException(err)
		return ctx.SendStatus(fiber.StatusNotFound)
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *UserIntegrationController) FetchHistorical(ctx *fiber.Ctx) error {
	id := ctx.Params("id")
	userId := getUserId(ctx)
	err := c.userIntegrationService.FetchHistorical(id, userId)
	if err != nil {
		sentry.CaptureException(err)
		return ctx.SendStatus(fiber.StatusNotFound)
	}

	return ctx.SendStatus(fiber.StatusOK)
}

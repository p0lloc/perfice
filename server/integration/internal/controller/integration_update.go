package controller

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"perfice.adoe.dev/integration/internal/service"
	"perfice.adoe.dev/integration/internal/util"
)

type IntegrationUpdateController struct {
	integrationUpdateService *service.IntegrationUpdateService
	validator                *validator.Validate
}

func NewIntegrationUpdateController(integrationUpdateService *service.IntegrationUpdateService) *IntegrationUpdateController {
	return &IntegrationUpdateController{integrationUpdateService, validator.New(validator.WithRequiredStructEnabled())}
}

type IntegrationUpdateResponse struct {
	ID            string                 `bson:"id" json:"id"`
	IntegrationId string                 `bson:"integrationId" json:"integrationId"`
	Identifier    string                 `bson:"identifier" json:"identifier"`
	Data          map[string]interface{} `bson:"data" json:"data"`
	Timestamp     int64                  `bson:"timestamp" json:"timestamp"`
}

type AcknowledgeUpdateRequest struct {
	Updates []primitive.ObjectID `json:"updates"`
}

func (c *IntegrationUpdateController) GetUpdates(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	updates, err := c.integrationUpdateService.GetUpdatesByUserId(userId)
	if err != nil {
		return err
	}

	var integrationUpdates = make([]IntegrationUpdateResponse, 0)
	for _, update := range updates {
		integrationUpdates = append(integrationUpdates, IntegrationUpdateResponse{
			ID:            update.ID.Hex(),
			IntegrationId: update.IntegrationId,
			Identifier:    update.Identifier,
			Data:          update.Data,
			Timestamp:     update.Timestamp,
		})
	}

	return ctx.JSON(integrationUpdates)
}

func (c *IntegrationUpdateController) AcknowledgeUpdates(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)

	var request AcknowledgeUpdateRequest
	if err := util.ParseAndValidate(ctx, c.validator, &request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	if err := c.integrationUpdateService.AcknowledgeUpdates(request.Updates, userId); err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

package controller

import (
	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/integration/internal/service"
)

type IntegrationWebhookController struct {
	service *service.IntegrationWebhookService
}

func NewIntegrationWebhookController(service *service.IntegrationWebhookService) *IntegrationWebhookController {
	return &IntegrationWebhookController{service}
}

func (c *IntegrationWebhookController) HandleWebhook(ctx *fiber.Ctx) error {
	token := ctx.Params("token")
	body := ctx.Body()

	if err := (*c.service).HandleWebhook(token, body); err != nil {
		return ctx.SendStatus(fiber.StatusInternalServerError)
	}
	return ctx.SendStatus(fiber.StatusOK)
}

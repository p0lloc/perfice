package controller

import (
	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/integration/internal/service"
)

type IntegrationAuthenticationController struct {
	integrationAuthService *service.IntegrationAuthenticationService
}

func NewIntegrationAuthenticationController(integrationAuthService *service.IntegrationAuthenticationService) *IntegrationAuthenticationController {
	return &IntegrationAuthenticationController{integrationAuthService}
}

func (c *IntegrationAuthenticationController) RedirectURL(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	integrationType := ctx.Params("integrationType")
	redirectUrl := c.integrationAuthService.RedirectURL(integrationType, userId)
	if redirectUrl == nil {
		return ctx.SendStatus(fiber.StatusNotFound)
	}

	return ctx.SendString(*redirectUrl)
}

func (c *IntegrationAuthenticationController) Callback(ctx *fiber.Ctx) error {
	integrationType := ctx.Params("integrationType")
	code := ctx.Query("code")
	state := ctx.Query("state")
	err := c.integrationAuthService.OnCallback(integrationType, code, state)
	if err != nil {
		return err
	}

	return ctx.SendString("You have successfully authenticated and can now close this window")
}

func (c *IntegrationAuthenticationController) GetAuthenticationStatus(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	integrationType := ctx.Params("integrationType")
	authenticated, err := c.integrationAuthService.IsIntegrationTypeAuthenticated(userId, integrationType)
	if err != nil {
		return err
	}

	if !authenticated {
		return ctx.SendStatus(fiber.StatusNotFound)
	}

	return ctx.SendStatus(fiber.StatusOK)
}

package internal

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type KeyRequest struct {
	Key []byte `json:"key" validate:"required"`
}

type KeyResponse struct {
	Key []byte `json:"key"`
}

type KeyController struct {
	keyVerificationService *KeyVerificationService
	validator              *validator.Validate
}

func NewKeyController(keyVerificationService *KeyVerificationService) *KeyController {
	return &KeyController{keyVerificationService, validator.New(validator.WithRequiredStructEnabled())}
}

func (c *KeyController) GetKey(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	key, err := c.keyVerificationService.GetKeyByUser(userId)
	if err != nil {
		return err
	}

	return ctx.JSON(KeyResponse{key})
}

func (c *KeyController) SetKey(ctx *fiber.Ctx) error {
	var req KeyRequest
	if err := ParseAndValidate(ctx, c.validator, &req); err != nil {
		return err
	}

	userId := getUserId(ctx)
	err := c.keyVerificationService.SetKey(userId, req.Key)
	if err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

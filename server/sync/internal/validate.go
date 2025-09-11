package internal

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func ParseAndValidate(ctx *fiber.Ctx, validator *validator.Validate, request any) error {
	if err := ctx.BodyParser(request); err != nil {
		return err
	}

	if err := validator.Struct(request); err != nil {
		return err
	}

	return nil
}

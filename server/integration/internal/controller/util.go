package controller

import (
	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/integration/internal/constants"
)

func getUserId(ctx *fiber.Ctx) string {
	return ctx.Locals(constants.UserIdLocal).(string)
}

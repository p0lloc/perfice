package internal

import "github.com/gofiber/fiber/v2"

type SaltController struct {
	saltService *SaltService
}

func NewSaltController(saltService *SaltService) *SaltController {
	return &SaltController{saltService}
}

type SaltResponse struct {
	Salt []byte `json:"salt"`
}

func (c *SaltController) GetSalt(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	salt, err := c.saltService.GetSalt(userId)
	if err != nil {
		return err
	}

	return ctx.JSON(SaltResponse{salt})
}

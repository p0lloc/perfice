package main

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

var userIdLocal string = "userId"
var sessionIdLocal string = "sessionId"

func (a *Gateway) authMiddleware(c *fiber.Ctx) error {
	headers := c.GetReqHeaders()
	authorization := util.GetFromMapOrNil(headers, "Authorization")
	if authorization == nil || len(*authorization) != 1 {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	parts := strings.Split((*authorization)[0], " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	request := &pb.AuthenticationRequest{
		Token: parts[1],
	}

	res, err := a.authClient.Authenticate(context.Background(), request)
	if err != nil {
		return err
	}

	auth := res.GetAuth()
	if auth == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	c.Locals(userIdLocal, auth.UserId)
	c.Locals(sessionIdLocal, auth.SessionId)

	return c.Next()
}

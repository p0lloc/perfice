package internal

import (
	"fmt"
	"log"
	"os"

	"github.com/getsentry/sentry-go"
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/golang-jwt/jwt/v5"
	"perfice.adoe.dev/util"
)

func (a *AuthApp) setupHttpServer(secret []byte, authService *AuthService, sessionService *SessionService, feedbackService *FeedbackService) {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			log.Println("Error occurred:", err)
			sentry.CaptureException(err)
			return ctx.SendStatus(fiber.StatusInternalServerError)
		},
	})

	app.Use(recover.New(
		recover.Config{
			EnableStackTrace: true,
		}))

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "https://localhost, http://localhost:8000, http://localhost:5173, https://perfice.adoe.dev",
		AllowHeaders:     "content-type, authorization",
		AllowCredentials: true,
	}))

	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: secret},
	})

	authController := NewAuthController(authService, sessionService)

	app.Post("/register", authController.Register)
	app.Post("/login", authController.Login)
	app.Post("/refresh", authController.Refresh)
	app.Put("/timezone", jwtMiddleware, authMiddleware, authController.SetTimezone)

	app.Get("/me", jwtMiddleware, authMiddleware, authController.Me)
	app.Post("/delete", jwtMiddleware, authMiddleware, authController.DeleteAccount)
	app.Post("/logout", jwtMiddleware, authMiddleware, authController.Logout)
	app.Get("/confirm/:token", authController.ConfirmEmail)
	app.Post("/resetInit", authController.InitResetPassword)
	app.Post("/reset", authController.ResetPassword)
	app.Get("/reset/:token", authController.FillResetPassword)

	feedbackController := NewFeedbackController(feedbackService)
	app.Post("/feedback", feedbackController.Feedback)

	port := os.Getenv("HTTP_PORT")
	fmt.Println("Serving HTTP on port " + port)
	err := app.Listen(":" + port)
	if err != nil {
		panic(err)
	}
}

func authMiddleware(c *fiber.Ctx) error {
	user := c.Locals("user")
	if user == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	token := user.(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)

	userId := util.GetFromMapOrNil(claims, "sub")
	sessionId := util.GetFromMapOrNil(claims, "session")

	if userId == nil || sessionId == nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	c.Locals(userIdLocal, *userId)
	c.Locals(sessionIdLocal, *sessionId)
	return c.Next()
}

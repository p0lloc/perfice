package internal

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthController struct {
	authService    *AuthService
	sessionService *SessionService
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SetTimezoneRequest struct {
	Timezone string `json:"timezone"`
}

type RefreshTokenRequest struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func sessionResponse(ctx *fiber.Ctx, session Session) error {
	return ctx.JSON(fiber.Map{
		"accessToken":  session.AccessToken,
		"refreshToken": session.RefreshToken,
	})
}

var userIdLocal string = "userId"
var sessionIdLocal string = "sessionId"

func getUserId(ctx *fiber.Ctx) string {
	return ctx.Locals(userIdLocal).(string)
}

func getSessionId(ctx *fiber.Ctx) string {
	return ctx.Locals(sessionIdLocal).(string)
}

func NewAuthController(authService *AuthService, sessionService *SessionService) *AuthController {
	return &AuthController{authService, sessionService}
}

func (c *AuthController) Register(ctx *fiber.Ctx) error {
	var request RegisterRequest
	if err := ctx.BodyParser(&request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	if err := c.authService.Register(c.sanitizeEmail(request.Email), request.Password); err != nil {
		if errors.Is(err, UserAlreadyExistsError{}) {
			return ctx.Status(fiber.StatusBadRequest).SendString("User already exists")
		} else {
			return err
		}
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *AuthController) sanitizeEmail(email string) string {
	return strings.Trim(strings.ToLower(email), " ")
}

func (c *AuthController) Login(ctx *fiber.Ctx) error {
	var request LoginRequest
	if err := ctx.BodyParser(&request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	session, err := c.authService.Login(c.sanitizeEmail(request.Email), request.Password)
	if err != nil {
		if errors.Is(err, UserNotConfirmedError{}) {
			return ctx.Status(fiber.StatusForbidden).SendString("Email not confirmed")
		}
		if errors.Is(err, InvalidCredentialsError{}) {
			return ctx.Status(fiber.StatusUnauthorized).SendString("Invalid username or password")
		}

		return err
	}

	return sessionResponse(ctx, session)
}

func (c *AuthController) Refresh(ctx *fiber.Ctx) error {
	var request RefreshTokenRequest
	if err := ctx.BodyParser(&request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	session, err := c.sessionService.Refresh(request.AccessToken, request.RefreshToken)
	if err != nil {
		return err
	}

	return sessionResponse(ctx, session)
}

func (c *AuthController) Logout(ctx *fiber.Ctx) error {
	sessionId := getSessionId(ctx)
	if err := c.sessionService.Logout(sessionId); err != nil {
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid session")
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *AuthController) SetTimezone(ctx *fiber.Ctx) error {
	var request SetTimezoneRequest
	if err := ctx.BodyParser(&request); err != nil {
		return ctx.SendStatus(fiber.StatusBadRequest)
	}

	userId := getUserId(ctx)

	_, err := time.LoadLocation(request.Timezone)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid timezone")
	}

	err = c.authService.SetTimezone(userId, request.Timezone)
	if err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *AuthController) Me(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	timezone, err := c.authService.GetUserTimeZone(userId)
	if err != nil {
		return err
	}

	return ctx.JSON(fiber.Map{
		"id":       userId,
		"timezone": timezone,
	})
}

func (c *AuthController) DeleteAccount(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	if err := c.authService.DeleteUser(userId); err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *AuthController) ConfirmEmail(ctx *fiber.Ctx) error {
	token, err := primitive.ObjectIDFromHex(ctx.Params("token"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	err = c.authService.ConfirmEmail(token)
	if err != nil {
		sentry.CaptureException(err)
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	return ctx.Type("html").SendString(fmt.Sprintf(confirmEmailHtml, appBaseUrl))
}

func (c *AuthController) InitResetPassword(ctx *fiber.Ctx) error {
	email := ctx.Query("email")
	err := c.authService.InitResetPassword(c.sanitizeEmail(email))
	if err != nil {
		sentry.CaptureException(err)
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	return ctx.SendStatus(fiber.StatusOK)
}
func (c *AuthController) FillResetPassword(ctx *fiber.Ctx) error {
	token, err := primitive.ObjectIDFromHex(ctx.Params("token"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	if !c.authService.ValidateResetPassword(token) {
		sentry.CaptureException(err)
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	return ctx.Type("html").SendString(fmt.Sprintf(resetPasswordInitHtml, token.Hex()))
}

func (c *AuthController) ResetPassword(ctx *fiber.Ctx) error {
	token, err := primitive.ObjectIDFromHex(ctx.FormValue("token"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	password := ctx.FormValue("password")
	err = c.authService.ResetPassword(token, password)
	if err != nil {
		sentry.CaptureException(err)
		return ctx.Status(fiber.StatusBadRequest).SendString("Invalid token")
	}

	return ctx.Type("html").SendString(fmt.Sprintf(resetPasswordHtml, appBaseUrl))
}

type FeedbackController struct {
	feedbackService *FeedbackService
}

func NewFeedbackController(feedbackService *FeedbackService) *FeedbackController {
	return &FeedbackController{feedbackService}
}

func (c *FeedbackController) Feedback(ctx *fiber.Ctx) error {
	feedback := ctx.Body()
	if err := c.feedbackService.Insert(string(feedback)); err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

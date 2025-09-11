package internal

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	_ "github.com/joho/godotenv/autoload"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/constants"
	"perfice.adoe.dev/integration/internal/controller"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/integration/internal/service"
	pb "perfice.adoe.dev/proto"
)

type IntegrationApp struct {
	db *mongo.Database

	userIntegrationService      *service.UserIntegrationService
	integrationTypeService      *service.IntegrationTypeService
	integrationAuthService      *service.IntegrationAuthenticationService
	integrationFetchService     *service.IntegrationFetchService
	integrationUpdateService    *service.IntegrationUpdateService
	integrationSchedulerService *service.IntegrationSchedulerService
	authClient                  pb.UserServiceClient
}

func NewIntegrationApp() *IntegrationApp {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(os.Getenv("MONGO_URL")))
	if err != nil {
		panic(err)
	}

	if err := client.Ping(context.Background(), readpref.Primary()); err != nil {
		panic(err)
	}

	return &IntegrationApp{
		db: client.Database("integration"),
	}
}

func (a *IntegrationApp) setupServices() {
	userIntegrationCollection := collection.NewUserIntegrationCollection(a.db.Collection("user_integrations"))
	fetchedLogCollection := collection.NewFetchedIntegrationEntityLogCollection(a.db.Collection("entity_log"))
	a.userIntegrationService = service.NewUserIntegrationService(userIntegrationCollection, fetchedLogCollection, a.authClient)
	a.userIntegrationService.AddCreateCallback(func(integration model.UserIntegration) {
		resp, err := a.authClient.GetUserTimeZone(context.Background(), &pb.GetUserTimeZoneRequest{UserId: integration.UserId})
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to get user timezone: %v\n", err))
			return
		}

		err = a.integrationSchedulerService.ScheduleIntegration(integration, resp.Timezone)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to create integration scheduler job: %v\n", err))
		}
	})

	a.userIntegrationService.AddDeleteCallback(func(integrationId string) {
		err := a.integrationSchedulerService.UnscheduleJobByIntegrationId(integrationId)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to delete integration scheduler job: %v\n", err))
		}
	})

	integrationTypeCollection := collection.NewIntegrationTypeCollection(a.db.Collection("integration_types"))
	integrationEntityCollection := collection.NewIntegrationEntityCollection(a.db.Collection("integration_entities"))
	a.integrationTypeService = service.NewIntegrationTypeService(integrationTypeCollection, integrationEntityCollection)
	if err := a.integrationTypeService.Load(); err != nil {
		panic(err)
	}

	integrationAuthCollection := collection.NewIntegrationAuthenticationCollection(a.db.Collection("integration_auth"))
	a.integrationAuthService = service.NewIntegrationAuthenticationService(integrationAuthCollection, a.integrationTypeService)
	if err := a.integrationAuthService.Load(); err != nil {
		panic(err)
	}

	integrationUpdateCollection := collection.NewIntegrationUpdateCollection(a.db.Collection("integration_updates"))
	a.integrationUpdateService = service.NewIntegrationUpdateService(integrationUpdateCollection)
	a.userIntegrationService.AddDeleteCallback(func(s string) {
		err := a.integrationUpdateService.OnIntegrationDeleted(s)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to delete integration updates: %v\n", err))
		}
	})
	a.integrationFetchService = service.NewIntegrationFetchService(a.userIntegrationService, a.integrationTypeService, a.integrationAuthService,
		a.integrationUpdateService, fetchedLogCollection, a.authClient)
	a.integrationFetchService.Load()
	a.integrationSchedulerService = service.NewIntegrationSchedulerService(a.integrationFetchService, a.userIntegrationService, a.authClient)
	a.userIntegrationService.SetFetchService(a.integrationFetchService)

	if err := a.integrationSchedulerService.Load(); err != nil {
		panic(err)
	}

	kafka := service.NewKafkaService()
	kafka.OnTimezoneChange(func(userId string, timezone string) {
		integrations, err := a.userIntegrationService.GetIntegrationsByUserId(userId)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to get integrations for user %s: %v\n", userId, err))
			return
		}

		err = a.integrationSchedulerService.RescheduleIntegrations(integrations, timezone)
		if err != nil {
			sentry.CaptureException(err)
			return
		}
	})

	kafka.OnUserDeleted(func(userId string) {
		log.Println("Deleting integration-related data for user " + userId)
		if err := a.userIntegrationService.OnUserDeleted(userId); err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete user integrations: %v", err))
		}

		if err := a.integrationAuthService.OnUserDeleted(userId); err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete integration auth: %v", err))
		}

		if err := a.integrationUpdateService.OnUserDeleted(userId); err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete integration updates: %v", err))
		}
	})

	kafka.Read()
}

func (a *IntegrationApp) setupSentry() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: os.Getenv("SENTRY_DSN"),
	})

	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
}

func (a *IntegrationApp) setupHttpServer() {
	app := fiber.New(
		fiber.Config{
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

	userIntegrationController := controller.NewUserIntegrationController(a.userIntegrationService)
	integrationGroup := app.Group("/integrations")
	integrationGroup.Use(authMiddleware)
	integrationGroup.Get("/", userIntegrationController.GetIntegrations)
	integrationGroup.Post("/", userIntegrationController.Create)
	integrationGroup.Put("/:id", userIntegrationController.Update)
	integrationGroup.Delete("/:id", userIntegrationController.Delete)
	integrationGroup.Post("/:id/historical", userIntegrationController.FetchHistorical)

	integrationTypeController := controller.NewIntegrationTypeController(a.integrationTypeService, a.integrationAuthService)
	typeGroup := app.Group("/integrationTypes")
	typeGroup.Get("/", authMiddleware, integrationTypeController.GetIntegrationTypes)

	integrationAuthController := controller.NewIntegrationAuthenticationController(a.integrationAuthService)
	typeGroup.Get("/:integrationType/authenticated", authMiddleware, integrationAuthController.GetAuthenticationStatus)
	typeGroup.Get("/:integrationType/redirect", authMiddleware, integrationAuthController.RedirectURL)
	typeGroup.Get("/:integrationType/callback", integrationAuthController.Callback)

	integrationUpdateController := controller.NewIntegrationUpdateController(a.integrationUpdateService)
	app.Get("/updates", authMiddleware, integrationUpdateController.GetUpdates)
	app.Post("/updates/ack", authMiddleware, integrationUpdateController.AcknowledgeUpdates)

	defer sentry.Flush(2 * time.Second)
	log.Fatal(app.Listen(":" + os.Getenv("PORT")))
}

func (a *IntegrationApp) setupAuthService() *grpc.ClientConn {
	conn, err := grpc.NewClient(os.Getenv("AUTH_GRPC_URL"), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	a.authClient = pb.NewUserServiceClient(conn)
	return conn
}

func (a *IntegrationApp) Init() {
	fmt.Println("Running integration service")
	a.setupSentry()
	a.setupAuthService()
	a.setupServices()
	a.setupHttpServer()
}

func authMiddleware(c *fiber.Ctx) error {
	headers := c.GetReqHeaders()
	if val, ok := headers["X-Userid"]; ok {
		c.Locals(constants.UserIdLocal, val[0])
	} else {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	return c.Next()
}

package internal

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	_ "github.com/joho/godotenv/autoload"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "perfice.adoe.dev/proto"
)

type SyncApp struct {
	client *mongo.Client
	db     *mongo.Database

	entityTypes            []string
	syncService            *SyncService
	authClient             pb.UserServiceClient
	keyVerificationService *KeyVerificationService
	saltService            *SaltService
}

func NewSyncApp() *SyncApp {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(os.Getenv("MONGO_URL")))
	if err != nil {
		panic(err)
	}

	if err := client.Ping(context.Background(), readpref.Primary()); err != nil {
		panic(err)
	}
	return &SyncApp{
		client: client,
		db:     client.Database("sync"),
		entityTypes: []string{
			"trackables",
			"variables",
			"entries",
			"trackableCategories",
			"forms",
			"formSnapshots",
			"analyticSettings",
			"goals",
			"tags",
			"tagEntries",
			"formTemplates",
			"tagCategories",
			"dashboards",
			"dashboardWidgets",
			"reflections",
			"savedSearches",
			"notifications",
		},
	}
}

func (a *SyncApp) setupSentry() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: os.Getenv("SENTRY_DSN"),
	})

	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
}

func (a *SyncApp) Init() {
	a.setupAuthService()
	a.setupServices()
	a.setupSentry()
	a.setupHttpServer()
}

func (a *SyncApp) setupServices() {
	syncUpdateCollection := NewSyncUpdateCollection(a.db.Collection("sync_updates"))

	entityCollections := map[string]*mongo.Collection{}
	for _, entityType := range a.entityTypes {
		entityCollections[entityType] = a.db.Collection(entityType)
	}

	a.keyVerificationService = NewKeyVerificationService(NewKeyVerificationCollection(a.db.Collection("key_verifications")))
	a.syncService = NewSyncService(a.client, entityCollections, syncUpdateCollection, a.keyVerificationService, a.authClient)
	a.saltService = NewSaltService(NewSaltCollection(a.db.Collection("salts")))

	kafka := NewKafkaService()
	kafka.OnUserDeleted(func(userId string) {
		log.Println("Deleting sync-related data for user " + userId)
		err := a.syncService.OnUserDeleted(userId)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete sync updates: %v", err))
		}

		err = a.keyVerificationService.OnUserDeleted(userId)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete key verifications: %v", err))
		}

		err = a.saltService.OnUserDeleted(userId)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("failed to delete salts: %v", err))
		}
	})

	kafka.Read()
}

func (a *SyncApp) setupHttpServer() {
	app := fiber.New(
		fiber.Config{
			ErrorHandler: func(ctx *fiber.Ctx, err error) error {
				log.Println("Error occurred: ", err)
				sentry.CaptureException(err)
				return ctx.SendStatus(fiber.StatusInternalServerError)
			},
		})

	app.Use(recover.New(
		recover.Config{
			EnableStackTrace: true,
		}))

	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://localhost, http://localhost:8000, http://localhost:5173, https://perfice.adoe.dev",
		AllowMethods: "*",
		AllowHeaders: "*",
	}))

	syncController := NewSyncController(a.syncService, a.entityTypes)
	app.Post("/push", authMiddleware, syncController.Push)
	app.Post("/pull", authMiddleware, syncController.Pull)
	app.Post("/ack", authMiddleware, syncController.Ack)
	app.Post("/fullPull", authMiddleware, syncController.FullPull)

	keyGroup := app.Group("/key")
	keyController := NewKeyController(a.keyVerificationService)
	keyGroup.Get("/", authMiddleware, keyController.GetKey)
	keyGroup.Put("/", authMiddleware, keyController.SetKey)

	saltController := NewSaltController(a.saltService)
	app.Get("/salt", authMiddleware, saltController.GetSalt)

	defer sentry.Flush(2 * time.Second)
	log.Fatal(app.Listen(":" + os.Getenv("PORT")))
}

func (a *SyncApp) setupAuthService() *grpc.ClientConn {
	conn, err := grpc.NewClient(os.Getenv("AUTH_GRPC_URL"), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	a.authClient = pb.NewUserServiceClient(conn)
	return conn
}

func authMiddleware(c *fiber.Ctx) error {
	headers := c.GetReqHeaders()
	if val, ok := headers["X-Userid"]; ok {
		c.Locals(userIdLocal, val[0])
	} else {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	if val, ok := headers["X-Sessionid"]; ok {
		c.Locals(sessionIdLocal, val[0])
	} else {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	return c.Next()
}

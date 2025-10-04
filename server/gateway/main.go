package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	_ "github.com/joho/godotenv/autoload"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "perfice.adoe.dev/proto"
)

type Gateway struct {
	authClient pb.UserServiceClient
}

func (a *Gateway) setupAuthService() *grpc.ClientConn {
	conn, err := grpc.NewClient(os.Getenv("AUTH_GRPC_URL"), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	a.authClient = pb.NewUserServiceClient(conn)
	return conn
}

func main() {
	a := Gateway{}
	defer a.setupAuthService().Close()
	a.run()
}

func (a *Gateway) routeAuthService(app *fiber.App, httpClient *http.Client) {
	remoteBase := os.Getenv("AUTH_HTTP_URL")
	authGroup := app.Group("/auth")
	forwarder := newRequestForwarderWithHeaders(remoteBase, a.authMiddleware, httpClient, &authGroup, false,
		[]string{"content-type", "authorization"})

	forwarder.Get("/me", "/me").Forward()
	forwarder.Post("/login", "/login").Forward()
	forwarder.Post("/register", "/register").Forward()
	forwarder.Post("/logout", "/logout"). /*.Authenticated()*/ Forward()
	forwarder.Post("/refresh", "/refresh").
		Forward()
	forwarder.Put("/timezone", "/timezone").
		//Authenticated().
		Forward()
	forwarder.Post("/delete", "/delete"). /*.Authenticated()*/ Forward()
	forwarder.Get("/confirm/:token", "/confirm/%s", "token").Forward()
	forwarder.Post("/reset", "/reset").Forward()
	forwarder.Post("/resendConfirm", "/resendConfirm").Forward()
	forwarder.Post("/resetInit", "/resetInit").Forward()
	forwarder.Get("/reset/:token", "/reset/%s", "token").Forward()

	baseRouter := app.Group("/")
	baseForwarder := newRequestForwarder(remoteBase, a.authMiddleware, httpClient, &baseRouter, false)
	baseForwarder.Post("/feedback", "/feedback").
		Forward()
}

func (a *Gateway) routeSyncService(app *fiber.App, httpClient *http.Client) {
	remoteBase := os.Getenv("SYNC_URL")

	integrationGroup := app.Group("/api/sync")
	forwarder := newRequestForwarder(remoteBase, a.authMiddleware, httpClient, &integrationGroup, true)
	forwarder.Post("/push", "/push").Forward()
	forwarder.Post("/pull", "/pull").Forward()
	forwarder.Post("/ack", "/ack").Forward()
	forwarder.Post("/fullPull", "/fullPull").Forward()
	forwarder.Get("/key", "/key").Forward()
	forwarder.Put("/key", "/key").Forward()
	forwarder.Get("/salt", "/salt").Forward()
}

func (a *Gateway) routeIntegrationService(app *fiber.App, httpClient *http.Client) {
	remoteBase := os.Getenv("INTEGRATION_URL")

	integrationGroup := app.Group("/integrations")
	forwarder := newRequestForwarder(remoteBase+"/integrations", a.authMiddleware, httpClient, &integrationGroup, true)
	forwarder.Get("/", "").Forward()
	forwarder.Post("/", "").Forward()
	forwarder.Put("/:id", "/%s", "id").Forward()
	forwarder.Delete("/:id", "/%s", "id").Forward()
	forwarder.Post("/:id/historical", "/%s/historical", "id").Forward()

	baseRouter := app.Group("/")
	baseForwarder := newRequestForwarder(remoteBase, a.authMiddleware, httpClient, &baseRouter, false)
	baseForwarder.Post("/integrations/push/:token", "/integrations/push/%s", "token").Forward()

	typeGroup := app.Group("/integrationTypes")
	typeForwarder := newRequestForwarder(remoteBase+"/integrationTypes", a.authMiddleware, httpClient, &typeGroup, false)
	typeForwarder.Get("/", "").Authenticated().Forward()
	typeForwarder.Get("/:integrationType/authenticated", "/%s/authenticated", "integrationType").Authenticated().Forward()
	typeForwarder.Get("/:integrationType/redirect", "/%s/redirect", "integrationType").Authenticated().Forward()
	typeForwarder.Get("/:integrationType/callback", "/%s/callback", "integrationType").Forward()

	updateForwarder := newRequestForwarder(remoteBase+"/updates", a.authMiddleware, httpClient, &baseRouter, true)
	updateForwarder.Get("/updates", "").Forward()
	updateForwarder.Post("/updates/ack", "/ack").Forward()
}

func (a *Gateway) setupSentry() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: os.Getenv("SENTRY_DSN"),
	})

	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
}

func (a *Gateway) run() {
	httpClient := http.Client{}

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

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost, https://localhost, http://localhost:8000, http://localhost:5173, https://perfice.adoe.dev", // allow all origins, including no origin
		AllowHeaders:     "content-type, authorization",                                                                                 // allow all headers
		AllowCredentials: true,
	}))

	a.routeIntegrationService(app, &httpClient)
	a.routeAuthService(app, &httpClient)
	a.routeSyncService(app, &httpClient)
	a.setupSentry()

	defer sentry.Flush(2 * time.Second)
	log.Fatal(app.Listen(":" + os.Getenv("PORT")))
}

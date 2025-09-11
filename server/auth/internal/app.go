package internal

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	_ "github.com/joho/godotenv/autoload"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type AuthApp struct {
	db           *mongo.Database
	kafkaService *KafkaService
}

func NewAuthApp() *AuthApp {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(os.Getenv("MONGO_URL")))
	if err != nil {
		panic(err)
	}

	if err := client.Ping(context.Background(), readpref.Primary()); err != nil {
		panic(err)
	}

	return &AuthApp{
		db: client.Database("auth"),
	}
}

func (a *AuthApp) setupSentry() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn: os.Getenv("SENTRY_DSN"),
	})

	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
}

func (a *AuthApp) Init() {
	log.Println("Running auth server")
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	sessionService := NewSessionService(a.db.Collection("sessions"), jwtSecret)
	a.setupKafka()
	a.setupSentry()

	mailService := NewMailService()

	authService := NewAuthService(NewUserCollection(a.db.Collection("users")), NewAccountTokenCollection(a.db.Collection("accountTokens")),
		jwtSecret, sessionService, a.kafkaService, mailService)
	authService.OnUserDeleted(func(userId string) {
		err := sessionService.OnUserDeleted(userId)
		if err != nil {
			sentry.CaptureException(err)
		}
	})
	feedbackService := NewFeedbackService(a.db.Collection("feedback"))
	a.setupGrpcServer(sessionService, authService)
	a.setupHttpServer(jwtSecret, authService, sessionService, feedbackService)
	log.Println("Auth server initialized")

	defer sentry.Flush(2 * time.Second)
}

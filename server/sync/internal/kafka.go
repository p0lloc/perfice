package internal

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/segmentio/kafka-go"
)

type UserDeletedCallback func(userId string)

type KafkaService struct {
	conn *kafka.Reader

	userDeletedCallbacks []UserDeletedCallback
}

func NewKafkaService() *KafkaService {
	dialer := &kafka.Dialer{
		Timeout: 30 * time.Second,
	}

	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{os.Getenv("KAFKA_URL")},
		Topic:   "my-topic",
		Dialer:  dialer,
	})

	return &KafkaService{r, []UserDeletedCallback{}}
}

func (a *KafkaService) Read() {
	go func() {
		for {
			m, err := a.conn.ReadMessage(context.Background())
			if err != nil {
				sentry.CaptureException(err)
				log.Println("kafka read error", err)
				break
			}

			eventType := string(m.Key)
			eventData := string(m.Value)

			switch eventType {
			case "userDeleted":
				userId := eventData
				for _, callback := range a.userDeletedCallbacks {
					callback(userId)
				}
				break
			}
		}
	}()
}

func (a *KafkaService) OnUserDeleted(callback UserDeletedCallback) {
	a.userDeletedCallbacks = append(a.userDeletedCallbacks, callback)
}

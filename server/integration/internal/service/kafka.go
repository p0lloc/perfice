package service

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/segmentio/kafka-go"
)

type TimezoneChangeCallback func(userId string, timezone string)
type UserDeletedCallback func(userId string)

type KafkaService struct {
	conn *kafka.Reader

	timezoneChangeCallbacks []TimezoneChangeCallback
	userDeletedCallbacks    []UserDeletedCallback
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

	return &KafkaService{r, []TimezoneChangeCallback{}, []UserDeletedCallback{}}
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
			case "timezoneChange":
				parts := strings.Split(eventData, ":")
				if len(parts) != 2 {
					fmt.Printf("Invalid timezone change event: %s\n", eventData)
					continue
				}

				userId := parts[0]
				timezone := parts[1]

				for _, callback := range a.timezoneChangeCallbacks {
					callback(userId, timezone)
				}
				break

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

func (a *KafkaService) OnTimezoneChange(callback func(userId string, timezone string)) {
	a.timezoneChangeCallbacks = append(a.timezoneChangeCallbacks, callback)
}

func (a *KafkaService) OnUserDeleted(callback UserDeletedCallback) {
	a.userDeletedCallbacks = append(a.userDeletedCallbacks, callback)
}

package internal

import (
	"context"
	"os"
)
import "github.com/segmentio/kafka-go"

type KafkaService struct {
	conn *kafka.Writer
}

func (a *AuthApp) setupKafka() {
	w := &kafka.Writer{
		Addr:     kafka.TCP(os.Getenv("KAFKA_URL")),
		Topic:    "my-topic",
		Balancer: &kafka.LeastBytes{},
	}

	a.kafkaService = &KafkaService{w}
}

func (a *KafkaService) NotifyTimezoneChange(userId string, timezone string) error {
	return a.sendBasicMessage("timezoneChange", userId+":"+timezone)
}

func (a *KafkaService) NotifyUserDeleted(userId string) error {
	return a.sendBasicMessage("userDeleted", userId)
}

func (a *KafkaService) sendBasicMessage(topic string, value string) error {
	return a.conn.WriteMessages(
		context.Background(),
		kafka.Message{
			Key:   []byte(topic),
			Value: []byte(value),
		},
	)
}

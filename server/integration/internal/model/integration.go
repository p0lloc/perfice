package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type IntegrationTypeDefinition struct {
	IntegrationType string `bson:"integrationType" json:"integrationType"`
	Name            string
	Logo            string
	Authentication  *IntegrationAuthentication `bson:"authentication" json:"authentication"`
}

type IntegrationEntityField struct {
	Name string `json:"name"`
	Path any    `json:"path"`
}

type IntegrationOption struct {
	Type        string `json:"type"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type IntegrationEntityDefinition struct {
	EntityType      string                    `json:"entityType" bson:"entityType"`
	Name            string                    `json:"name" bson:"name"`
	IntegrationType string                    `json:"integrationType" bson:"integrationType"`
	Sources         []IntegrationEntitySource `json:"sources" bson:"sources"`
	//URL             string                            `json:"url" bson:"url"`
	//Interval        IntegrationFetchInterval          `json:"interval" bson:"interval"`
	Identifier  string                            `json:"identifier" bson:"identifier"`
	Timestamp   any                               `json:"timestamp" bson:"timestamp"`
	Multiple    string                            `json:"multiple,omitempty" bson:"multiple"`
	History     *HistoryOptions                   `json:"history" bson:"history"`
	Fields      map[string]IntegrationEntityField `json:"fields" bson:"fields"`
	Schema      map[string]interface{}            `json:"schema" bson:"schema"`
	LogSettings *IntegrationEntityLogSettings     `json:"logSettings" bson:"logSettings"`
	Options     map[string]IntegrationOption      `json:"options" bson:"options"`
}

var PullIntegrationEntitySourceType = "pull"
var PushIntegrationEntitySourceType = "push"

type IntegrationEntitySource struct {
	Type     string         `json:"type" bson:"type"`
	Settings map[string]any `json:"settings" bson:"settings"`
}

type PullIntegrationEntitySourceSettings struct {
	URL      string                   `json:"url" bson:"url"`
	Interval IntegrationFetchInterval `json:"interval" bson:"interval"`
}

type PushIntegrationEntitySourceSettings struct{}

type IntegrationEntityLogSettings struct {
	Identifier string `json:"identifier" bson:"identifier"`
}

type HistoryOptions struct {
	URL string `bson:"url"`
}

type IntegrationFetchInterval struct {
	Cron   string `json:"cron" bson:"cron"`
	Jitter int    `json:"jitter" bson:"jitter"`
}

type IntegrationUpdate struct {
	ID            primitive.ObjectID     `bson:"_id"`
	UserId        string                 `bson:"userId"`
	IntegrationId string                 `bson:"integrationId"`
	Identifier    string                 `bson:"identifier"`
	Timestamp     int64                  `bson:"timestamp"`
	Data          map[string]interface{} `bson:"data" encrypt:"true"`
}

type UserIntegration struct {
	Id              string                  `bson:"id" json:"id"`
	UserId          string                  `bson:"userId" json:"userId"`
	IntegrationType string                  `json:"integrationType" bson:"integrationType"`
	EntityType      string                  `json:"entityType" bson:"entityType"`
	Webhook         *UserIntegrationWebhook `json:"webhook" bson:"webhook"`
	FormId          string                  `json:"formId" bson:"formId"`
	Fields          map[string]string       `json:"fields" bson:"fields"`
	Options         map[string]any          `json:"options" bson:"options"`
}

type UserIntegrationWebhook struct {
	Token string `json:"token" bson:"token"`
}

type FetchedEntityLog struct {
	Identifier    string   `bson:"identifier"`
	EntityIds     []string `bson:"entityIds"`
	IntegrationId string   `bson:"integrationId"`
}

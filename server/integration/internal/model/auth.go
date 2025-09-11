package model

import (
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type IntegrationAuthentication struct {
	Method   string         `bson:"method" json:"method"`
	Settings map[string]any `bson:"settings" json:"settings"`
}

type RefreshCallback func(oldAccessToken string, newAccessToken string, newRefreshToken string, newExpiry int64)

type AuthenticationMethod interface {
	GenerateRedirectURL(userId string) string
	HandleCallback(integrationType string, code string, state string) (IntegrationCredentials, error)
	SetRefreshCallback(callback RefreshCallback)
	CreateClient(credentials IntegrationCredentials) (*http.Client, error)
}

type IntegrationCredentials struct {
	Id              primitive.ObjectID `bson:"_id" json:"id"`
	IntegrationType string             `bson:"integrationType" json:"integrationType"`
	User            string             `bson:"user" json:"-"`
	AccessToken     string             `bson:"access_token" json:"-" encrypt:"true"`
	RefreshToken    string             `bson:"refresh_token" json:"-" encrypt:"true"`
	Expiry          int64              `bson:"expiry"`
}

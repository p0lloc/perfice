package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"perfice.adoe.dev/integration/internal/auth"
)

func TestDeserializeAuthenticationSettings_OAuth(t *testing.T) {
	svc := &IntegrationAuthenticationService{}

	settings := map[string]any{
		"authorize_url": "https://example.com/auth",
		"token_url":     "https://example.com/token",
		"scopes":        bson.A{"read", "write"},
		"client_id":     "my-client-id",
		"client_secret": "my-secret",
		"pkce":          true,
	}

	redirectUrl := "https://myapp.com/redirect"

	method := svc.deserializeAuthenticationSettings(settings, "oauth", redirectUrl)

	_, ok := method.(*auth.OAuthAuthenticationMethod)
	assert.True(t, ok, "method should be of type *OAuthAuthenticationMethod")
}

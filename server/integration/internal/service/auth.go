package service

import (
	"fmt"
	"os"

	"github.com/getsentry/sentry-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"perfice.adoe.dev/integration/internal/auth"
	"perfice.adoe.dev/integration/internal/collection"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/util"
)

type IntegrationAuthenticationService struct {
	integrationAuthenticationCollection *collection.IntegrationAuthenticationCollection
	integrationTypeService              *IntegrationTypeService

	authenticationMethods map[string]model.AuthenticationMethod
}

func NewIntegrationAuthenticationService(integrationAuthenticationCollection *collection.IntegrationAuthenticationCollection, integrationTypeService *IntegrationTypeService) *IntegrationAuthenticationService {
	return &IntegrationAuthenticationService{integrationAuthenticationCollection, integrationTypeService, nil}
}

func (s *IntegrationAuthenticationService) deserializeAuthenticationSettings(settings map[string]any, method string, redirectUrl string) model.AuthenticationMethod {
	switch method {
	case "oauth":
		return auth.NewOAuthAuthenticationMethod(redirectUrl, auth.OAuthAuthenticationMethodSettings{
			AuthorizeURL: settings["authorize_url"].(string),
			TokenURL:     settings["token_url"].(string),
			Scopes:       util.CastSlice[string](settings["scopes"].(bson.A)),
			ClientID:     settings["client_id"].(string),
			ClientSecret: settings["client_secret"].(string),
			PKCE:         settings["pkce"].(bool),
		})
	}

	return nil
}

func (s *IntegrationAuthenticationService) Load() error {
	s.authenticationMethods = map[string]model.AuthenticationMethod{}

	for _, definition := range s.integrationTypeService.GetIntegrationTypes() {
		if definition.Authentication == nil {
			continue
		}

		method := s.deserializeAuthenticationSettings(definition.Authentication.Settings,
			definition.Authentication.Method, fmt.Sprintf(os.Getenv("CALLBACK_URL_BASE")+"/integrationTypes/%s/callback", definition.IntegrationType))

		if method == nil {
			return fmt.Errorf("Failed to deserialize authentication method %s\n", definition.Authentication.Method)
		}

		method.SetRefreshCallback(func(oldAccessToken string, newAccessToken string, newRefreshToken string, newExpiry int64) {
			err := s.handleTokenRefresh(oldAccessToken, newAccessToken, newRefreshToken, newExpiry)
			if err != nil {
				sentry.CaptureException(fmt.Errorf("Failed to handle token refresh: %v\n", err))
			}
		})
		s.authenticationMethods[definition.IntegrationType] = method
	}

	return nil
}

func (s *IntegrationAuthenticationService) handleTokenRefresh(oldAccessToken string, newAccessToken string, newRefreshToken string, newExpiry int64) error {
	// TODO: this seems the only reliable way to get credential by access token, since it's encrypted
	allCredentials, err := s.integrationAuthenticationCollection.GetAllCredentials()
	if err != nil {
		return err
	}

	credentials := util.SliceFind(allCredentials, func(val model.IntegrationCredentials) bool {
		return val.AccessToken == oldAccessToken
	})

	if credentials == nil {
		return nil
	}

	credentials.AccessToken = newAccessToken
	credentials.RefreshToken = newRefreshToken
	credentials.Expiry = newExpiry

	_, err = s.integrationAuthenticationCollection.Update(*credentials)
	return err
}

func (s *IntegrationAuthenticationService) RedirectURL(integrationType string, userId string) *string {
	method := util.GetFromMapOrNil(s.authenticationMethods, integrationType)
	if method == nil {
		return nil
	}

	url := (*method).GenerateRedirectURL(userId)
	return &url
}

func (s *IntegrationAuthenticationService) OnCallback(integrationType string, code string, state string) error {
	method := util.GetFromMapOrNil(s.authenticationMethods, integrationType)
	if method == nil {
		return nil
	}

	credentials, err := (*method).HandleCallback(integrationType, code, state)
	if err != nil {
		return err
	}

	existing, err := s.integrationAuthenticationCollection.FindCredentialsByUserIdAndIntegrationType(credentials.User, integrationType)
	if err != nil {
		return err
	}

	if existing != nil {
		_, err = s.integrationAuthenticationCollection.Update(credentials)
		if err != nil {
			return err
		}
	} else {
		credentials.Id = primitive.NewObjectID()
		err = s.integrationAuthenticationCollection.Insert(credentials)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *IntegrationAuthenticationService) GetCredentialsByUserId(userId string) ([]model.IntegrationCredentials, error) {
	return s.integrationAuthenticationCollection.FindCredentialsByUserId(userId)
}

func (s *IntegrationAuthenticationService) GetCredentialsByUserIdAndIntegrationType(userId string, integrationType string) (*model.IntegrationCredentials, error) {
	return s.integrationAuthenticationCollection.FindCredentialsByUserIdAndIntegrationType(userId, integrationType)
}

func (s *IntegrationAuthenticationService) IsIntegrationTypeAuthenticated(userId string, integrationType string) (bool, error) {
	def := s.integrationTypeService.GetIntegrationType(integrationType)
	if def == nil {
		return false, nil
	}

	if def.Authentication == nil {
		return true, nil
	}

	credentials, err := s.integrationAuthenticationCollection.FindCredentialsByUserIdAndIntegrationType(userId, integrationType)
	if err != nil {
		return false, err
	}

	return credentials != nil, nil
}

func (s *IntegrationAuthenticationService) GetAuthenticationMethod(integrationType string) model.AuthenticationMethod {
	if val, ok := s.authenticationMethods[integrationType]; ok {
		return val
	}

	return nil
}

func (s *IntegrationAuthenticationService) DeleteCredentials(userId string, integrationType string) error {
	_, err := s.integrationAuthenticationCollection.DeleteCredentialsByUserIdAndIntegrationType(userId, integrationType)
	return err
}

func (s *IntegrationAuthenticationService) OnUserDeleted(id string) error {
	return s.integrationAuthenticationCollection.DeleteCredentialsByUserId(id)
}

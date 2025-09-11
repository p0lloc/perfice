package auth

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/sync/singleflight"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/util"
)

type oauthAuthenticationState struct {
	userId   string
	verifier string
}

type OAuthAuthenticationMethod struct {
	config    *oauth2.Config
	verifiers map[string]oauthAuthenticationState
	refreshFn model.RefreshCallback
	pkce      bool
}

func NewOAuthAuthenticationMethod(redirectUrl string, settings OAuthAuthenticationMethodSettings) model.AuthenticationMethod {
	config := &oauth2.Config{
		ClientID:     settings.ClientID,
		ClientSecret: settings.ClientSecret,
		Scopes:       settings.Scopes,
		RedirectURL:  redirectUrl,
		Endpoint: oauth2.Endpoint{
			AuthURL:  settings.AuthorizeURL,
			TokenURL: settings.TokenURL,
		},
	}
	return &OAuthAuthenticationMethod{config, map[string]oauthAuthenticationState{}, nil, settings.PKCE}
}

var refreshGroup singleflight.Group

// OAuthCustomSource is a wrapper around an oauth2.TokenSource that keeps track
// of when the token is refreshed.
type OAuthCustomSource struct {
	src         oauth2.TokenSource
	current     *oauth2.Token
	onRefreshFn func(oldAccessToken string, token *oauth2.Token)
}

func newLoggingTokenSource(src oauth2.TokenSource, current *oauth2.Token, onRefreshFn func(oldAccessToken string, token *oauth2.Token)) *OAuthCustomSource {
	return &OAuthCustomSource{src, current, onRefreshFn}
}

func (l *OAuthCustomSource) Token() (*oauth2.Token, error) {
	if !l.current.Valid() {
		val, err, _ := refreshGroup.Do(l.current.AccessToken, func() (interface{}, error) {
			token, err := l.src.Token()
			if err != nil {
				return nil, err
			}

			if token.AccessToken != l.current.AccessToken {
				l.onRefreshFn(l.current.AccessToken, token)
			}

			l.current = token
			return token, nil
		})

		if err != nil {
			return nil, err
		}

		return val.(*oauth2.Token), nil
	}

	return l.current, nil
}

type OAuthAuthenticationMethodSettings struct {
	AuthorizeURL string
	TokenURL     string
	Scopes       []string
	ClientID     string
	ClientSecret string
	PKCE         bool
}

func (m *OAuthAuthenticationMethod) GenerateRedirectURL(userId string) string {
	verifier := ""
	if m.pkce {
		verifier = oauth2.GenerateVerifier()
	}

	state := uuid.NewString()
	m.verifiers[state] = oauthAuthenticationState{userId, verifier}

	options := []oauth2.AuthCodeOption{oauth2.AccessTypeOffline}
	if m.pkce {
		options = append(options, oauth2.S256ChallengeOption(verifier))
	}

	return m.config.AuthCodeURL(state, options...)
}

func (m *OAuthAuthenticationMethod) HandleCallback(integrationType string, code string, stateString string) (model.IntegrationCredentials, error) {
	state := util.GetFromMapOrNil(m.verifiers, stateString)
	if state == nil {
		return model.IntegrationCredentials{}, errors.New("invalid state")
	}

	var options []oauth2.AuthCodeOption
	if m.pkce {
		options = append(options, oauth2.VerifierOption(state.verifier))
	}

	tok, err := m.config.Exchange(context.Background(), code, options...)
	if err != nil {
		return model.IntegrationCredentials{}, err
	}

	return model.IntegrationCredentials{
		IntegrationType: integrationType,
		User:            state.userId,
		AccessToken:     tok.AccessToken,
		RefreshToken:    tok.RefreshToken,
		Expiry:          tok.Expiry.UnixMilli(),
	}, nil
}

func (m *OAuthAuthenticationMethod) SetRefreshCallback(callback model.RefreshCallback) {
	m.refreshFn = callback
}

func (m *OAuthAuthenticationMethod) CreateClient(credentials model.IntegrationCredentials) (*http.Client, error) {
	token := oauth2.Token{
		TokenType:    "Bearer",
		AccessToken:  credentials.AccessToken,
		RefreshToken: credentials.RefreshToken,
		Expiry:       time.UnixMilli(credentials.Expiry),
	}

	tokenSource := newLoggingTokenSource(m.config.TokenSource(context.Background(), &token),
		&token,
		func(oldToken string, token *oauth2.Token) {
			m.refreshFn(oldToken, token.AccessToken, token.RefreshToken, token.Expiry.UnixMilli())
		})

	return oauth2.NewClient(context.Background(), tokenSource), nil
}

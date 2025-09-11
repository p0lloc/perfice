package internal

import (
	"crypto/rand"
	"errors"
	"math/big"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/mongoutil"
)

type Session struct {
	Id   string `bson:"_id"`
	User string `bson:"user"`

	AccessToken  string `bson:"accessToken"`
	RefreshToken string `bson:"refreshToken"`

	LastRefresh int64 `bson:"lastRefresh"`
	Expiry      int64 `bson:"expiry"`
}

var accessTokenExpiry = time.Minute * 15
var refreshTokenLength = 16
var characters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

type SessionService struct {
	jwtSecret         []byte
	sessionCollection *mongo.Collection
}

func NewSessionService(sessionCollection *mongo.Collection, jwtSecret []byte) *SessionService {
	return &SessionService{jwtSecret, sessionCollection}
}

func (s *SessionService) GetSessions(userId string) ([]Session, error) {
	return mongoutil.Find[Session](s.sessionCollection, bson.M{"user": userId})
}

func (s *SessionService) AuthenticateToken(tokenStr string) (string, string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})
	if err != nil {
		return "", "", err
	}

	if token == nil {
		return "", "", errors.New("invalid token")
	}

	claims := token.Claims.(jwt.MapClaims)
	sub, err := claims.GetSubject()
	if err != nil {
		return "", "", err
	}

	if !token.Valid {
		return "", "", errors.New("invalid token")
	}

	session, ok := claims["session"].(string)
	if !ok {
		return "", "", errors.New("invalid token")
	}

	return sub, session, nil
}

func (s *SessionService) Create(userId string) (Session, error) {
	sessionId := uuid.NewString()
	expiry := time.Now().Add(accessTokenExpiry).UnixMilli()

	accessToken, err := s.createAccessToken(userId, sessionId, expiry)
	if err != nil {
		return Session{}, err
	}

	refreshToken, err := s.createRefreshToken()
	if err != nil {
		return Session{}, err
	}

	session := Session{
		Id:           sessionId,
		User:         userId,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		LastRefresh:  time.Now().UnixMilli(),
		Expiry:       expiry,
	}

	if err := mongoutil.Insert(s.sessionCollection, session); err != nil {
		return Session{}, err
	}

	return session, nil
}

func (s *SessionService) Refresh(accessToken string, refreshToken string) (Session, error) {
	session, err := s.getSessionByAccessTokenAndRefreshToken(accessToken, refreshToken)
	if err != nil {
		return Session{}, err
	}

	if session == nil {
		return Session{}, errors.New("unable to refresh token: invalid session")
	}

	newExpiry := time.Now().Add(accessTokenExpiry).UnixMilli()
	newAccessToken, err := s.createAccessToken(session.User, session.Id, newExpiry)
	if err != nil {
		return Session{}, err
	}

	newRefreshToken, err := s.createRefreshToken()
	if err != nil {
		return Session{}, err
	}

	session.Expiry = newExpiry
	session.LastRefresh = time.Now().UnixMilli()
	session.AccessToken = newAccessToken
	session.RefreshToken = newRefreshToken

	_, err = mongoutil.SetOne(s.sessionCollection, bson.M{
		"_id": session.Id,
	}, session)

	if err != nil {
		return Session{}, err
	}

	return *session, nil
}

func (s *SessionService) createRefreshToken() (string, error) {
	token := make([]rune, refreshTokenLength)
	for j := 0; j < refreshTokenLength; j++ {
		index, err := rand.Int(rand.Reader, big.NewInt(int64(len(characters))))
		if err != nil {
			return "", err
		}

		token[j] = characters[index.Int64()]
	}

	return string(token), nil
}

func (s *SessionService) createAccessToken(userId string, sessionId string, expiry int64) (string, error) {
	claims := jwt.MapClaims{
		"sub":     userId,
		"session": sessionId,
		"exp":     expiry / 1000,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *SessionService) getSessionByAccessTokenAndRefreshToken(accessToken string, refreshToken string) (*Session, error) {
	session, err := mongoutil.FindOne[Session](s.sessionCollection, bson.M{"accessToken": accessToken, "refreshToken": refreshToken})
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *SessionService) Logout(sessionId string) error {
	_, err := mongoutil.DeleteOne(s.sessionCollection, bson.M{"_id": sessionId})
	return err
}

func (s *SessionService) OnUserDeleted(id string) error {
	_, err := mongoutil.DeleteMany(s.sessionCollection, bson.M{"user": id})
	return err
}

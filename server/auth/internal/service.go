package internal

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/matthewhartstonge/argon2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/util"
)
import "perfice.adoe.dev/mongoutil"

type UserDeletedCallback func(userId string)

type AuthService struct {
	jwtSecret              []byte
	userCollection         *UserCollection
	accountTokenCollection *AccountTokenCollection
	argon                  argon2.Config

	sessionService       *SessionService
	kafkaService         *KafkaService
	cachedTimezones      util.GenericSyncMap[string, string]
	userDeletedCallbacks []UserDeletedCallback
	mailService          *MailService
}

func NewAuthService(userCollection *UserCollection, accountTokenCollection *AccountTokenCollection, jwtSecret []byte,
	sessionService *SessionService, kafkaService *KafkaService, mailService *MailService) *AuthService {
	return &AuthService{
		jwtSecret:              jwtSecret,
		userCollection:         userCollection,
		accountTokenCollection: accountTokenCollection,
		argon:                  argon2.DefaultConfig(),
		sessionService:         sessionService,
		kafkaService:           kafkaService,
		cachedTimezones:        util.GenericSyncMap[string, string]{},
		userDeletedCallbacks:   []UserDeletedCallback{},
		mailService:            mailService,
	}
}

func (a *AuthService) OnUserDeleted(callback UserDeletedCallback) {
	a.userDeletedCallbacks = append(a.userDeletedCallbacks, callback)
}

func (a *AuthService) getUserByEmail(email string) (*User, error) {
	return a.userCollection.GetUserByEmail(email)
}

type UserAlreadyExistsError struct{}

func (e UserAlreadyExistsError) Error() string {
	return "user already exists"
}

type UserNotConfirmedError struct{}

func (e UserNotConfirmedError) Error() string {
	return "user not confirmed"
}

type InvalidCredentialsError struct{}

func (e InvalidCredentialsError) Error() string {
	return "invalid credentials"
}

func (a *AuthService) GetUserTimeZone(userId string) (string, error) {
	val, ok := a.cachedTimezones.Load(userId)
	if ok {
		return val, nil
	}

	user, err := a.userCollection.GetUserById(userId)
	if err != nil {
		return "", err
	}

	if user == nil {
		return "", errors.New("user not found")
	}

	a.cachedTimezones.Store(userId, user.Timezone)
	return user.Timezone, nil
}

func (a *AuthService) Register(email string, password string) error {
	existing, err := a.getUserByEmail(email)
	if err != nil {
		return err
	}

	if existing != nil {
		return UserAlreadyExistsError{}
	}

	hashedPassword, err := a.argon.HashEncoded([]byte(password))
	if err != nil {
		return err
	}

	user := User{
		Id:       uuid.NewString(),
		Email:    email,
		Password: string(hashedPassword),
		Timezone: "Europe/Amsterdam",
	}

	if err := a.createConfirmationEmail(user); err != nil {
		return err
	}

	return a.userCollection.Create(user)
}

func (a *AuthService) createConfirmationEmail(user User) error {
	confirmationToken, err := a.accountTokenCollection.Create(user.Id, confirmationAccountToken)
	if err != nil {
		return err
	}

	err = a.mailService.SendEmailConfirmationMail(user.Email, confirmationToken.Id.Hex())
	if err != nil {
		return err
	}

	return nil
}

func (a *AuthService) Login(email string, password string) (Session, error) {
	user, err := a.getUserByEmail(email)
	if err != nil {
		return Session{}, err
	}

	if user == nil {
		return Session{}, errors.New("invalid email")
	}

	if !user.Confirmed {
		return Session{}, UserNotConfirmedError{}
	}

	ok, err := argon2.VerifyEncoded([]byte(password), []byte(user.Password))
	if err != nil {
		return Session{}, err
	}

	if !ok {
		return Session{}, InvalidCredentialsError{}
	}

	session, err := a.sessionService.Create(user.Id)
	if err != nil {
		return Session{}, err
	}

	return session, nil
}

func (a *AuthService) SetTimezone(userId string, timezone string) error {
	err := a.userCollection.UpdateTimezone(userId, timezone)
	if err != nil {
		return err
	}

	a.cachedTimezones.Store(userId, timezone)
	return a.kafkaService.NotifyTimezoneChange(userId, timezone)
}

func (a *AuthService) GetUsersTimeZones(ids []string) (map[string]string, error) {
	if len(ids) < 1 {
		return map[string]string{}, nil
	}

	users, err := a.userCollection.GetUsersByIds(ids)
	if err != nil {
		return nil, err
	}

	timezones := map[string]string{}
	for _, user := range users {
		timezones[user.Id] = user.Timezone
	}

	return timezones, nil
}

func (a *AuthService) DeleteUser(userId string) error {
	err := a.userCollection.DeleteUserById(userId)
	if err != nil {
		return err
	}

	err = a.kafkaService.NotifyUserDeleted(userId)
	if err != nil {
		return err
	}

	err = a.accountTokenCollection.DeleteByUserId(userId)
	if err != nil {
		return err
	}

	for _, callback := range a.userDeletedCallbacks {
		callback(userId)
	}

	return nil
}

func (a *AuthService) ConfirmEmail(token primitive.ObjectID) error {
	found, err := a.accountTokenCollection.GetAndDeleteById(token, confirmationAccountToken)
	if err != nil {
		return err
	}

	if found == nil {
		return errors.New("invalid token")
	}

	return a.userCollection.ConfirmEmail(found.UserId)
}
func (a *AuthService) ResetPassword(token primitive.ObjectID, newPassword string) error {
	found, err := a.accountTokenCollection.GetAndDeleteById(token, passwordResetAccountToken)
	if err != nil {
		return err
	}

	if found == nil {
		return errors.New("invalid token")
	}

	user, err := a.userCollection.GetUserById(found.UserId)
	if err != nil {
		return err
	}

	if user == nil {
		return errors.New("invalid token")
	}

	hashedPassword, err := a.argon.HashEncoded([]byte(newPassword))
	if err != nil {
		return err
	}

	err = a.userCollection.UpdatePassword(user.Id, string(hashedPassword))
	if err != nil {
		return err
	}

	return nil
}

func (a *AuthService) InitResetPassword(email string) error {
	user, err := a.userCollection.GetUserByEmail(email)
	if err != nil {
		return err
	}

	if user == nil {
		return nil
	}

	token, err := a.accountTokenCollection.Create(user.Id, passwordResetAccountToken)
	if err != nil {
		return err
	}

	return a.mailService.SendPasswordResetMail(email, token.Id.Hex())
}

func (a *AuthService) ValidateResetPassword(token primitive.ObjectID) bool {
	found, err := a.accountTokenCollection.GetById(token, passwordResetAccountToken)
	if err != nil {
		return false
	}

	return found != nil
}

func (a *AuthService) ResendConfirmationEmail(email string) error {
	user, err := a.userCollection.GetUserByEmail(email)
	if err != nil {
		return err
	}

	if user == nil || user.Confirmed {
		return errors.New("invalid email")
	}

	return a.createConfirmationEmail(*user)
}

type FeedbackService struct {
	feedbackCollection *mongo.Collection
}

func NewFeedbackService(feedbackCollection *mongo.Collection) *FeedbackService {
	return &FeedbackService{feedbackCollection}
}

type Feedback struct {
	Feedback  string `bson:"feedback"`
	Timestamp int64  `bson:"timestamp"`
}

func (f *FeedbackService) Insert(feedback string) error {
	return mongoutil.Insert(f.feedbackCollection, Feedback{Feedback: feedback, Timestamp: time.Now().UnixMilli()})
}

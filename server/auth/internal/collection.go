package internal

import (
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/mongoutil"
)

type UserCollection struct {
	collection *mongo.Collection
}

func NewUserCollection(collection *mongo.Collection) *UserCollection {
	return &UserCollection{collection}
}

func (a *UserCollection) Create(user User) error {
	return mongoutil.Insert(a.collection, user)
}

func (a *UserCollection) GetUserByEmail(email string) (*User, error) {
	user, err := mongoutil.FindOne[User](a.collection, bson.M{"email": email})
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (a *UserCollection) UpdateTimezone(userId string, timezone string) error {
	_, err := mongoutil.SetOne(a.collection, bson.M{"_id": userId}, bson.M{"timezone": timezone})
	if err != nil {
		return err
	}

	return nil
}

func (a *UserCollection) DeleteUserById(userId string) error {
	_, err := mongoutil.DeleteOne(a.collection, bson.M{"_id": userId})
	if err != nil {
		return err
	}

	return nil
}

func (a *UserCollection) GetUsersByIds(ids []string) ([]User, error) {
	return mongoutil.Find[User](a.collection, bson.M{"_id": bson.M{"$in": ids}})
}

func (a *UserCollection) GetUserById(id string) (*User, error) {
	user, err := mongoutil.FindOne[User](a.collection, bson.M{"_id": id})
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (a *UserCollection) ConfirmEmail(id string) error {
	_, err := mongoutil.SetOne(a.collection, bson.M{"_id": id}, bson.M{"confirmed": true})
	return err
}

func (a *UserCollection) UpdatePassword(userId string, password string) error {
	_, err := mongoutil.SetOne(a.collection, bson.M{"_id": userId}, bson.M{"password": password})
	return err
}

var confirmationAccountToken = "confirmation"
var passwordResetAccountToken = "passwordReset"

type AccountToken struct {
	Id        primitive.ObjectID `bson:"_id"`
	UserId    string             `bson:"userId"`
	Type      string             `bson:"type"`
	Timestamp int64              `bson:"timestamp"`
}

type AccountTokenCollection struct {
	collection *mongo.Collection
}

func NewAccountTokenCollection(collection *mongo.Collection) *AccountTokenCollection {
	return &AccountTokenCollection{collection}
}

func (c *AccountTokenCollection) Create(userId string, tokenType string) (*AccountToken, error) {
	accountToken := AccountToken{
		Id:        primitive.NewObjectID(),
		UserId:    userId,
		Type:      tokenType,
		Timestamp: time.Now().UnixMilli(),
	}

	err := mongoutil.Insert(c.collection, accountToken)
	if err != nil {
		return nil, err
	}

	return &accountToken, nil
}

func (c *AccountTokenCollection) GetById(id primitive.ObjectID, typeName string) (*AccountToken, error) {
	return mongoutil.FindOne[AccountToken](c.collection, bson.M{"_id": id, "type": typeName})
}

func (c *AccountTokenCollection) GetAndDeleteById(id primitive.ObjectID, typeName string) (*AccountToken, error) {
	token, err := mongoutil.FindOne[AccountToken](c.collection, bson.M{"_id": id, "type": typeName})
	if err != nil {
		return nil, err
	}

	if token == nil {
		return nil, nil
	}

	err = c.DeleteById(id)
	if err != nil {
		return nil, err
	}

	return token, nil
}

func (c *AccountTokenCollection) DeleteById(id primitive.ObjectID) error {
	_, err := mongoutil.DeleteOne(c.collection, bson.M{"_id": id})
	if err != nil {
		return err
	}

	return nil
}

func (c *AccountTokenCollection) DeleteByUserId(userId string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"userId": userId})
	if err != nil {
		return err
	}

	return nil
}

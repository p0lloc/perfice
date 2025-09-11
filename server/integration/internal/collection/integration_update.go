package collection

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type IntegrationUpdateCollection struct {
	collection *mongo.Collection
}

func NewIntegrationUpdateCollection(collection *mongo.Collection) *IntegrationUpdateCollection {
	return &IntegrationUpdateCollection{collection}
}

func (c *IntegrationUpdateCollection) Insert(update model.IntegrationUpdate) error {
	return mongoutil.InsertEncrypt(c.collection, update)
}

func (c *IntegrationUpdateCollection) Update(update model.IntegrationUpdate) (bool, error) {
	return mongoutil.SetEncryptOne(c.collection, bson.M{"_id": update.ID}, update)
}

func (c *IntegrationUpdateCollection) FindUpdatesByUserId(userId string) ([]model.IntegrationUpdate, error) {
	return mongoutil.FindDecrypt[model.IntegrationUpdate](c.collection, bson.M{"userId": userId})
}

func (c *IntegrationUpdateCollection) FindUpdateByIntegrationIdAndIdentifier(integrationId string, identifier string) (*model.IntegrationUpdate, error) {
	return mongoutil.FindDecryptOne[model.IntegrationUpdate](c.collection, bson.M{"integrationId": integrationId, "identifier": identifier})
}

func (c *IntegrationUpdateCollection) DeleteUpdatesByIdsAndUserId(ids []primitive.ObjectID, id string) error {
	if len(ids) < 1 {
		return nil
	}

	_, err := mongoutil.DeleteMany(c.collection, bson.M{"_id": bson.M{"$in": ids}, "userId": id})
	return err
}

func (c *IntegrationUpdateCollection) DeleteUpdatesByUserId(id string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"userId": id})
	return err
}

func (c *IntegrationUpdateCollection) DeleteUpdatesByIntegrationId(id string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"integrationId": id})
	return err
}

package collection

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type IntegrationAuthenticationCollection struct {
	collection *mongo.Collection
}

func NewIntegrationAuthenticationCollection(collection *mongo.Collection) *IntegrationAuthenticationCollection {
	return &IntegrationAuthenticationCollection{collection}
}

func (c *IntegrationAuthenticationCollection) Insert(credentials model.IntegrationCredentials) error {
	return mongoutil.InsertEncrypt(c.collection, credentials)
}

func (c *IntegrationAuthenticationCollection) GetAllCredentials() ([]model.IntegrationCredentials, error) {
	return mongoutil.FindDecrypt[model.IntegrationCredentials](c.collection, bson.M{})
}

func (c *IntegrationAuthenticationCollection) Update(credentials model.IntegrationCredentials) (bool, error) {
	return mongoutil.SetEncryptOne(c.collection, bson.M{"_id": credentials.Id}, credentials)
}

func (c *IntegrationAuthenticationCollection) FindCredentialsByUserId(userId string) ([]model.IntegrationCredentials, error) {
	return mongoutil.FindDecrypt[model.IntegrationCredentials](c.collection, bson.M{"user": userId})
}

func (c *IntegrationAuthenticationCollection) FindCredentialsByUserIdAndIntegrationType(userId string, integrationType string) (*model.IntegrationCredentials, error) {
	return mongoutil.FindDecryptOne[model.IntegrationCredentials](c.collection, bson.M{"user": userId, "integrationType": integrationType})
}

func (c *IntegrationAuthenticationCollection) DeleteCredentialsByUserIdAndIntegrationType(userId string, integrationType string) (bool, error) {
	return mongoutil.DeleteOne(c.collection, bson.M{"user": userId, "integrationType": integrationType})
}

func (c *IntegrationAuthenticationCollection) DeleteCredentialsByUserId(id string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"user": id})
	return err
}

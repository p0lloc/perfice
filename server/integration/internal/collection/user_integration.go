package collection

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type UserIntegrationCollection struct {
	collection *mongo.Collection
}

func NewUserIntegrationCollection(collection *mongo.Collection) *UserIntegrationCollection {
	return &UserIntegrationCollection{collection}
}

func (c *UserIntegrationCollection) FindAllIntegrations() ([]model.UserIntegration, error) {
	return mongoutil.Find[model.UserIntegration](c.collection, bson.M{})
}

func (c *UserIntegrationCollection) FindIntegrationByIdAndUserId(id string, userId string) (*model.UserIntegration, error) {
	return mongoutil.FindOne[model.UserIntegration](c.collection, bson.M{"id": id, "userId": userId})
}

func (c *UserIntegrationCollection) Insert(integration model.UserIntegration) error {
	return mongoutil.Insert(c.collection, integration)
}

func (c *UserIntegrationCollection) Update(integration model.UserIntegration) (bool, error) {
	return mongoutil.SetOne(c.collection, bson.M{"id": integration.Id}, integration)
}

func (c *UserIntegrationCollection) FindIntegrationsByUserId(userId string) ([]model.UserIntegration, error) {
	return mongoutil.Find[model.UserIntegration](c.collection, bson.M{"userId": userId})
}

func (c *UserIntegrationCollection) DeleteByIdAndUserId(id string, userId string) (bool, error) {
	return mongoutil.DeleteOne(c.collection, bson.M{"id": id, "userId": userId})
}

func (c *UserIntegrationCollection) FindIntegrationById(id string) (*model.UserIntegration, error) {
	return mongoutil.FindOne[model.UserIntegration](c.collection, bson.M{"id": id})
}

func (c *UserIntegrationCollection) GetIntegrationCountByUserId(id string) (int64, error) {
	return mongoutil.Count(c.collection, bson.M{"userId": id})
}

func (c *UserIntegrationCollection) DeleteByUserId(id string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"userId": id})
	return err
}

package collection

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type IntegrationTypeCollection struct {
	collection *mongo.Collection
}

func NewIntegrationTypeCollection(collection *mongo.Collection) *IntegrationTypeCollection {
	return &IntegrationTypeCollection{collection}
}

func (c *IntegrationTypeCollection) FindIntegrationTypes() ([]model.IntegrationTypeDefinition, error) {
	return mongoutil.Find[model.IntegrationTypeDefinition](c.collection, bson.M{})
}

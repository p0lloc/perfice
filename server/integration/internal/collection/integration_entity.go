package collection

import (
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type IntegrationEntityCollection struct {
	collection *mongo.Collection
}

func NewIntegrationEntityCollection(collection *mongo.Collection) *IntegrationEntityCollection {
	return &IntegrationEntityCollection{collection}
}

func (c *IntegrationEntityCollection) FindIntegrationEntities() ([]model.IntegrationEntityDefinition, error) {
	return mongoutil.Find[model.IntegrationEntityDefinition](c.collection, nil)
}

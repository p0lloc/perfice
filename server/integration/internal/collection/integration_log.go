package collection

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"perfice.adoe.dev/integration/internal/model"
	"perfice.adoe.dev/mongoutil"
)

type FetchedIntegrationEntityLogCollection struct {
	collection *mongo.Collection
}

func NewFetchedIntegrationEntityLogCollection(collection *mongo.Collection) *FetchedIntegrationEntityLogCollection {
	return &FetchedIntegrationEntityLogCollection{collection}
}

func (c *FetchedIntegrationEntityLogCollection) Insert(log model.FetchedEntityLog) error {
	return mongoutil.Insert(c.collection, log)
}

func (c *FetchedIntegrationEntityLogCollection) FindByIntegrationIdAndIdentifier(id string, identifier string) (*model.FetchedEntityLog, error) {
	return mongoutil.FindOne[model.FetchedEntityLog](c.collection, bson.M{"integrationId": id, "identifier": identifier})
}

func (c *FetchedIntegrationEntityLogCollection) AddEntities(integrationId string, identifier string, entityIds []string) error {
	_, err := mongoutil.PushOne(c.collection, bson.M{"integrationId": integrationId, "identifier": identifier}, bson.M{"entityIds": bson.M{"$each": entityIds}})
	return err
}

func (c *FetchedIntegrationEntityLogCollection) RemoveEntities(integrationId string, identifier string, entityIds []string) error {
	if len(entityIds) < 1 {
		return nil
	}

	_, err := mongoutil.PullOne(c.collection, bson.M{"integrationId": integrationId, "identifier": identifier}, bson.M{"entityIds": bson.M{"$in": entityIds}})
	return err
}

func (c *FetchedIntegrationEntityLogCollection) DeleteByIntegrationIds(ids []string) error {
	_, err := mongoutil.DeleteMany(c.collection, bson.M{"integrationId": bson.M{"$in": ids}})
	return err
}

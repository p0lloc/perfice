package mongoutil

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx context.Context = context.Background()

func FindOne[T any](collection *mongo.Collection, filter bson.M) (*T, error) {
	var data T
	result := collection.FindOne(ctx, filter)
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) { // Suppress "No documents" errors
			return nil, nil
		}

		return nil, err
	}

	err := result.Decode(&data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func SetOne(collection *mongo.Collection, filter bson.M, set any, opts ...*options.UpdateOptions) (bool, error) {
	result, err := collection.UpdateOne(ctx, filter, bson.M{
		"$set": set,
	}, opts...)

	if err != nil {
		return false, err
	}

	return result.MatchedCount > 0, nil
}

func DeleteOne(collection *mongo.Collection, filter bson.M) (bool, error) {
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		return false, err
	}

	return true, nil
}

func DeleteMany(collection *mongo.Collection, filter bson.M) (bool, error) {
	_, err := collection.DeleteMany(ctx, filter)
	if err != nil {
		return false, err
	}

	return true, nil
}

func PullOne(collection *mongo.Collection, filter bson.M, pull bson.M) (bool, error) {
	result, err := collection.UpdateOne(ctx, filter, bson.M{
		"$pull": pull,
	})

	if err != nil {
		return false, err
	}

	return result.MatchedCount > 0, err
}

func PushOne(collection *mongo.Collection, filter bson.M, push bson.M) (bool, error) {
	result, err := collection.UpdateOne(ctx, filter, bson.M{
		"$push": push,
	})

	if err != nil {
		return false, err
	}

	return result.MatchedCount > 0, err
}

func Find[T any](collection *mongo.Collection, filter bson.M, opts ...*options.FindOptions) ([]T, error) {
	data := make([]T, 0)
	result, err := collection.Find(ctx, filter, opts...)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) { // Suppress "No documents" errors
			return data, nil
		}

		return nil, err
	}

	err = result.All(context.Background(), &data)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func Count(collection *mongo.Collection, filter bson.M, opts ...*options.CountOptions) (int64, error) {
	return collection.CountDocuments(ctx, filter, opts...)
}

func Insert(collection *mongo.Collection, data any) error {
	_, err := collection.InsertOne(ctx, data)
	return err
}

func Upsert(collection *mongo.Collection, filter bson.M, data any) error {
	_, err := collection.UpdateOne(ctx, filter, bson.M{
		"$set": data,
	}, options.Update().SetUpsert(true))

	return err
}

func InsertMany(context context.Context, collection *mongo.Collection, data []any) error {
	_, err := collection.InsertMany(context, data)
	return err
}

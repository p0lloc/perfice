package mongoutil

import (
	"errors"
	"reflect"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func FindDecrypt[T any](collection *mongo.Collection, filter bson.M) ([]T, error) {
	maps, err := Find[bson.M](collection, filter)
	if err != nil {
		return nil, err
	}

	if maps == nil {
		return nil, nil
	}

	var result []T
	for _, value := range maps {
		data, err := decodeEncryptedData[T](value)
		if err != nil {
			return nil, err
		}

		result = append(result, data)
	}

	return result, nil
}

func FindDecryptOne[T any](collection *mongo.Collection, filter bson.M) (*T, error) {
	bsonMap, err := FindOne[bson.M](collection, filter)

	if err != nil {
		return nil, err
	}

	if bsonMap == nil {
		return nil, nil
	}

	data, err := decodeEncryptedData[T](*bsonMap)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func InsertEncrypt(collection *mongo.Collection, data any) error {
	val, err := defaultEncrypter.EncryptAny(data)
	if err != nil {
		return err
	}

	return Insert(collection, val)
}

func SetEncryptOne(collection *mongo.Collection, filter bson.M, data any) (bool, error) {
	val, err := defaultEncrypter.EncryptAny(data)
	if err != nil {
		return false, err
	}

	return SetOne(collection, filter, val)
}

func decodeMongoMap(value primitive.M) map[string]any {
	res := map[string]any{}
	for k, v := range value {
		if v == nil {
			res[k] = nil
			continue
		}

		res[k] = v
	}

	return res
}

func decodeEncryptedData[T any](bsonMap bson.M) (T, error) {
	decoded := decodeMongoMap(bsonMap)

	var result T
	if id, ok := decoded["_id"]; ok {
		decoded["id"] = id
		delete(decoded, "_id")
	} else {
		return result, errors.New("data is missing id")
	}

	resultType := reflect.TypeOf(result)
	resultValue := reflect.ValueOf(result)
	for i := 0; i < resultValue.NumField(); i++ {
		fieldType := resultType.Field(i)
		bsonName := getBsonName(fieldType)

		if fieldType.Tag.Get("encrypt") == "true" {
			if val, ok := bsonMap[bsonName].(primitive.Binary); ok {
				decrypted, err := decryptValue(val.Data, fieldType.Type)
				if err != nil {
					return result, err
				}

				bsonMap[bsonName] = decrypted
			}
		}
	}

	// TODO: there seems to be no other way to convert a bson.M directly back to the struct
	//  We could potentially use the mapstructure package for this
	data, err := bson.Marshal(bsonMap)
	if err != nil {
		return result, err
	}

	err = bson.Unmarshal(data, &result)
	if err != nil {
		return result, err
	}

	return result, nil
}

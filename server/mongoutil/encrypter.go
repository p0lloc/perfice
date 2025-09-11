package mongoutil

import (
	"bytes"
	"crypto/rand"
	"encoding/binary"
	"encoding/gob"
	"errors"
	"fmt"
	"math"
	"os"
	"reflect"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/chacha20poly1305"
)

var defaultEncrypter = Encrypter{}
var encryptionKey = []byte(os.Getenv("ENCRYPTION_KEY"))

func handleDecryptedValue(decrypted []byte, expectedType reflect.Type) (any, error) {
	switch expectedType.Kind() {
	case reflect.String:
		{
			return string(decrypted), nil
		}
	case reflect.Float64:
		{
			return Float64frombytes(decrypted), nil
		}
	case reflect.Bool:
		{
			if len(decrypted) > 0 && decrypted[0] == 1 {
				return true, nil
			} else {
				return false, nil
			}
		}
	case reflect.Map:
		{
			buffer := bytes.NewBuffer(decrypted)
			decoder := gob.NewDecoder(buffer)
			// TODO: is there any way we can support other map types? we must explicitly cast to map[string]any
			newMap := reflect.New(expectedType).Elem().Interface().(map[string]any)

			err := decoder.Decode(&newMap)
			if err != nil {
				fmt.Println("decryption failed to decode map")
				return nil, err
			}

			return newMap, nil
		}
	case reflect.Interface:
		{
			char := decrypted[0]
			subslice := decrypted[1:]

			switch char {
			case 0:
				{
					return handleDecryptedValue(subslice, reflect.TypeOf(1.0))
				}
			case 1:
				{
					return handleDecryptedValue(subslice, reflect.TypeOf(""))
				}
			case 2:
				{
					return handleDecryptedValue(subslice, reflect.TypeOf(false))
				}
			default:
				{
					return nil, fmt.Errorf("unable to decrypt unknown (any) type %s", expectedType.Kind().String())
				}

			}
		}
	default:
		return nil, fmt.Errorf("unable to decrypt unsupported type %s", expectedType.Kind().String())
	}
}

func decryptValue(bz []byte, expectedType reflect.Type) (any, error) {
	decrypted, err := decryptBytes(bz)
	if err != nil {
		return nil, err
	}

	return handleDecryptedValue(decrypted, expectedType)
}

type Encrypter struct {
}

func (e *Encrypter) EncryptAny(val any) (bson.M, error) {

	bsonData, err := bson.Marshal(val)
	if err != nil {
		fmt.Println("bson marshal err")
		return nil, err
	}

	var bsonDoc bson.M
	err = bson.Unmarshal(bsonData, &bsonDoc)
	if err != nil {
		fmt.Println("bson unmarshal err")
		return nil, err
	}

	_, err = e.encryptValue(reflect.ValueOf(val), bsonDoc)
	if err != nil {
		return nil, err
	}

	return bsonDoc, nil
}

func (e *Encrypter) isNil(value reflect.Value) bool {
	switch value.Kind() {
	case reflect.Chan, reflect.Func, reflect.Map, reflect.Pointer, reflect.UnsafePointer, reflect.Interface, reflect.Slice:
		return value.IsNil()
	case reflect.Array:
		return value.IsZero()
	default:
		return false
	}
}

func (e *Encrypter) encryptValue(value reflect.Value, doc any) (reflect.Value, error) {

	indirected := reflect.Indirect(value)

	if indirected.Kind() == 0 {
		return value, nil
	}

	switch indirected.Kind() {
	case reflect.Slice:
		{
			return e.encryptSlice(value, doc)
		}
	case reflect.Struct:
		{
			return e.encryptStruct(value, doc)
		}
	case reflect.Map:
		{
			return e.encryptMap(value, doc)
		}
	case reflect.Interface:
		{
			return e.encryptValue(value.Elem(), doc)
		}
	default:
		return value, nil
	}
}

func (e *Encrypter) encryptSlice(value reflect.Value, doc any) (reflect.Value, error) {
	reflectValue := reflect.Indirect(value)

	var newSlice = make([]any, 0)
	slice := reflect.ValueOf(newSlice)
	for i := 0; i < reflectValue.Len(); i++ {
		element := reflectValue.Index(i)

		unmapped, err := e.encryptValue(element, reflect.ValueOf(doc).Index(i).Interface())
		if err != nil {
			return reflect.Value{}, err
		}

		slice = reflect.Append(slice, unmapped)
	}

	return value, nil
}

func getBsonName(fieldType reflect.StructField) string {
	bsonName := fieldType.Tag.Get("bson")
	if bsonName == "inline" || bsonName == ",inline" {
		return ""
	}

	if bsonName == "" {
		bsonName = strings.ToLower(fieldType.Name)
	}

	return bsonName
}

func (e *Encrypter) encryptStruct(value reflect.Value, doc any) (reflect.Value, error) {
	indirected := reflect.Indirect(value)
	reflectType := indirected.Type()
	res := map[string]any{}
	for i := 0; i < indirected.NumField(); i++ {
		fieldValue := indirected.Field(i)
		fieldType := reflectType.Field(i)

		bsonName := getBsonName(fieldType)
		if dmap, ok := doc.(primitive.M); ok {
			if _, ok := dmap[bsonName]; ok {

				if fieldType.Tag.Get("encrypt") == "true" {
					encrypted, err := e.encryptPrimitive(fieldValue)
					if err != nil {
						return reflect.ValueOf(nil), err
					}

					dmap[bsonName] = encrypted
				}
			}

			_, err := e.encryptValue(fieldValue, dmap[bsonName])
			if err != nil {
				return reflect.Value{}, err
			}
		} else {
			return reflect.Value{}, fmt.Errorf("unable to encrypt struct, document is %s", reflect.TypeOf(doc))
		}

		res[fieldType.Name] = fieldValue.Interface()
	}

	return reflect.ValueOf(res), nil
}

func (e *Encrypter) encryptMap(mapValue reflect.Value, doc any) (reflect.Value, error) {
	return transformMap(mapValue, func(val reflect.Value) (reflect.Value, error) {
		return e.encryptValue(val, doc)
	})
}

func transformMap(mapValue reflect.Value, callback func(reflect.Value) (reflect.Value, error)) (reflect.Value, error) {
	keys := mapValue.MapKeys()
	for _, key := range keys {
		mapEntry := mapValue.MapIndex(key)

		if mapEntry.Kind() == reflect.Interface && mapEntry.IsNil() {
			continue
		}

		// Clone the map entry
		val := reflect.New(mapEntry.Type()).Elem()
		val.Set(mapEntry)

		// Unmap it
		unmapped, err := callback(val)
		if err != nil {
			return reflect.Value{}, err
		}

		// Set the unmapped value back in the map
		mapValue.SetMapIndex(key, unmapped)
	}

	return mapValue, nil
}

func (e *Encrypter) getPrimitiveBytes(value reflect.Value) ([]byte, error) {

	val := value.Interface()
	switch value.Kind() {
	case reflect.String:
		return []byte(val.(string)), nil
	case reflect.Float64:
		return Float64bytes(val.(float64)), nil

	case reflect.Bool:
		if val == true {
			return []byte{1}, nil
		} else {
			return []byte{0}, nil
		}
	case reflect.Map:
		var buffer bytes.Buffer
		encoder := gob.NewEncoder(&buffer)
		err := encoder.Encode(val)
		if err != nil {
			return nil, err
		}

		return buffer.Bytes(), nil
	case reflect.Interface:
		v := reflect.Indirect(value).Interface()

		var bytes []byte
		var typeId byte = 100
		switch v.(type) {
		case float64:
			typeId = 0
			enc, err := e.getPrimitiveBytes(reflect.ValueOf(v.(float64)))
			if err != nil {
				return nil, err
			}

			bytes = enc
		case string:
			typeId = 1
			enc, err := e.getPrimitiveBytes(reflect.ValueOf(v.(string)))
			if err != nil {
				return nil, err
			}

			bytes = enc

		case bool:
			typeId = 2
			enc, err := e.getPrimitiveBytes(reflect.ValueOf(v.(bool)))
			if err != nil {
				return nil, err
			}

			bytes = enc
		default:
			return nil, errors.New("unable to encrypt unsupported (any) type")
		}

		var result []byte
		result = append(result, typeId)
		result = append(result, bytes...)
		return result, nil
	}

	return nil, errors.New("unable to encrypt unsupported type")
}

func (e *Encrypter) encryptPrimitive(value reflect.Value) ([]byte, error) {
	if e.isNil(value) {
		return nil, nil
	}

	bz, err := e.getPrimitiveBytes(value)
	if err != nil {
		return nil, err
	}

	return encryptBytes(bz)
}

func Float64bytes(float float64) []byte {
	bits := math.Float64bits(float)
	bytes := make([]byte, 8)
	binary.LittleEndian.PutUint64(bytes, bits)
	return bytes
}

func Float64frombytes(bytes []byte) float64 {
	bits := binary.LittleEndian.Uint64(bytes)
	float := math.Float64frombits(bits)
	return float
}

func encryptBytes(bytes []byte) ([]byte, error) {
	aead, err := chacha20poly1305.NewX(encryptionKey)
	if err != nil {
		return nil, err
	}

	var encryptedBytes []byte
	nonce := make([]byte, aead.NonceSize(), aead.NonceSize()+len(bytes)+aead.Overhead())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}

	encryptedBytes = aead.Seal(nonce, nonce, bytes, nil)

	return encryptedBytes, nil
}

func decryptBytes(bytes []byte) ([]byte, error) {
	aead, err := chacha20poly1305.NewX(encryptionKey)
	if err != nil {
		return nil, err
	}

	if len(bytes) < aead.NonceSize() {
		return nil, errors.New("ciphertext too short")
	}

	nonce, ciphertext := bytes[:aead.NonceSize()], bytes[aead.NonceSize():]

	plaintext, err := aead.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

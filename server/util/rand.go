package util

import (
	"crypto/rand"
	"encoding/base64"
	"math/big"
)

var characters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func GenerateAlphanumericString(keyLength int) (string, error) {
	token := make([]rune, keyLength)
	for j := 0; j < keyLength; j++ {
		index, err := rand.Int(rand.Reader, big.NewInt(int64(len(characters))))
		if err != nil {
			return "", err
		}

		token[j] = characters[index.Int64()]
	}

	return string(token), nil
}

func GenerateRandomBytesString(keyLength int) (string, error) {
	token := make([]byte, keyLength)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(token), nil
}

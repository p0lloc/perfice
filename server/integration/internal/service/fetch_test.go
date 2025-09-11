package service

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestIntegrationFetchService_BasicURL(t *testing.T) {
	svc := &IntegrationFetchService{}

	result, err := svc.replaceURLVariables("https://example.com", map[string]string{}, time.Now(), time.Now(), time.Now())
	if err != nil {
		panic(err)
	}

	assert.Equal(t, "https://example.com", result, "url should be mapped correctly")
}
func TestIntegrationFetchService_VariableURL(t *testing.T) {
	svc := &IntegrationFetchService{
		variables: defaultVariableLookups,
	}

	result, err := svc.replaceURLVariables("https://example.com?test=[DATE]", map[string]string{},
		time.Date(2022, 3, 3, 0, 0, 0, 0, time.Local), time.Now(), time.Now())

	if err != nil {
		panic(err)
	}

	assert.Equal(t, "https://example.com?test=2022-03-03", result, "url should be mapped correctly")
}

func TestIntegrationFetchService_OptionsURL(t *testing.T) {
	svc := &IntegrationFetchService{
		variables: defaultVariableLookups,
	}

	result, err := svc.replaceURLVariables("https://example.com?test=[DATE]&abc=[test]", map[string]string{
		"test": "123",
	},
		time.Date(2022, 3, 3, 0, 0, 0, 0, time.Local), time.Now(), time.Now())

	if err != nil {
		panic(err)
	}

	assert.Equal(t, "https://example.com?abc=123&test=2022-03-03", result, "url should be mapped correctly")
}

func TestIntegrationFetchService_EscapedOptionsURL(t *testing.T) {
	svc := &IntegrationFetchService{
		variables: defaultVariableLookups,
	}

	result, err := svc.replaceURLVariables("https://example.com?test=[DATE]&abc=[test]", map[string]string{
		"test": "&hackerman=true",
	},
		time.Date(2022, 3, 3, 0, 0, 0, 0, time.Local), time.Now(), time.Now())

	if err != nil {
		panic(err)
	}

	assert.Equal(t, "https://example.com?abc=%26hackerman%3Dtrue&test=2022-03-03", result, "url should be escaped correctly")
}

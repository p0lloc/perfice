package service

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PaesslerAG/jsonpath"
)

type IntegrationVariableEvaluator struct {
	variables map[string]VariableLookup
}

func NewIntegrationVariableEvaluator() IntegrationVariableEvaluator {
	return IntegrationVariableEvaluator{variables: defaultVariableLookups}
}

type VariableLookup func(now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error)

var defaultVariableLookups = map[string]VariableLookup{
	"DATE": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.Format("2006-01-02"), nil
	},
	"DATE_TIME": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.Format(time.RFC3339), nil
	},
	"DATE_TIME_MIDNIGHT": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Format(time.RFC3339), nil
	},
	"DATE_TIME_TOMORROW_MIDNIGHT": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location()).Format(time.RFC3339), nil
	},
	"DATE_TOMORROW": func(now time.Time, _ time.Time, _ time.Time) (string, error) {
		return now.AddDate(0, 0, 1).Format("2006-01-02"), nil
	},
	"START": func(now time.Time, rangeStart time.Time, _ time.Time) (string, error) {
		return rangeStart.Format("2006-01-02"), nil
	},
	"END": func(now time.Time, _ time.Time, rangeEnd time.Time) (string, error) {
		return rangeEnd.Format("2006-01-02"), nil
	},
}

func (s *IntegrationVariableEvaluator) replaceURLVariables(inputUrl string, options map[string]string, now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error) {
	availableVariables := map[string]VariableLookup{}
	for varName, lookup := range s.variables {
		availableVariables[varName] = lookup
	}

	for varName, value := range options {
		availableVariables[varName] = func(now time.Time, rangeStart time.Time, rangeEnd time.Time) (string, error) {
			return value, nil
		}
	}

	result := inputUrl
	for varName, lookup := range availableVariables {
		varName = fmt.Sprintf("[%s]", varName)
		if strings.Contains(result, varName) {
			val, err := lookup(now, rangeStart, rangeEnd)
			if err != nil {
				return "", fmt.Errorf("failed to evaluate variable %s: %v", varName, err)
			}

			result = strings.ReplaceAll(result, varName, url.QueryEscape(val))
		}
	}

	return result, nil
}

func (s *IntegrationVariableEvaluator) evaluateIdentifier(identifier string, options map[string]string, data interface{}, now time.Time) (string, error) {

	identifier, err := s.replaceURLVariables(identifier, options, now, now, now)
	if err != nil {
		return "", err
	}

	if strings.HasPrefix(identifier, "$") {
		identifierValue, err := jsonpath.Get(identifier, data)
		if err != nil {
			return "", fmt.Errorf("failed to evaluate identifier JSONPath: %v", err)
		}

		if floatValue, ok := identifierValue.(float64); ok {
			identifier = strconv.FormatFloat(floatValue, 'f', -1, 64)
		} else {
			identifier = fmt.Sprintf("%v", identifierValue)
		}
	}

	return identifier, nil
}

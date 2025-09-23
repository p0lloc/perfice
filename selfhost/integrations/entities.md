---
id: entities
sidebar_position: 2
---

# Integration entities
Integration types define an interesting entity that you wish to fetch into Perfice. Each entity fetches data from a *single* URL and can fetch multiple fields. Currently JSON is the only supported format.   

An example of an integration entity looks like this:
```json
{
  "entityType": "sleep",
  "integrationType": "FITBIT",
  "name": "Sleep",
  "sources": [
    {
      "type": "pull",
      "settings": {
        "url": "https://api.fitbit.com/1.2/user/-/sleep/date/[DATE].json",
        "interval": {
          "cron": "0 */2 * * *",
          "jitter": 0.0
        }
      }
    } 
  ],
  "history": {
    "url": "https://api.fitbit.com/1.2/user/-/sleep/date/[START]/[DATE].json"
  },
  "timestamp": {
    "#date_time_notz": "$.endTime"
  },
  "logSettings": {
    "identifier": "[DATE]"
  },
  "multiple": "$.sleep",
  "identifier": "$.logId",
  "fields": {
    "efficiency": {
      "name": "Efficiency",
      "path": "$.efficiency"
    },
    "deep_sleep": {
      "name": "Deep sleep minutes",
      "path": "$.levels.summary.deep.minutes"
    },
    "light_sleep": {
      "name": "Light sleep minutes",
      "path": "$.levels.summary.light.minutes"
    },
    "rem_sleep": {
      "name": "REM sleep minutes",
      "path": "$.levels.summary.rem.minutes"
    },
    "minutes_asleep": {
      "name": "Minutes asleep",
      "path": "$.minutesAsleep"
    },
    "minutes_awake": {
      "name": "Minutes awake",
      "path": "$.minutesAwake"
    }
  },
  "schema": {
    "type": "object",
    "properties": {
      "sleep": {
        "type": "array",
        "minItems": 1.0
      }
    },
    "required": [
      "sleep"
    ]
  },
  "options": {}
}
```
## Sources
Sources define where data is received from, currently `pull` and `push` are supported.
### Pull
Data is pulled from an external API.
#### Interval for pulling
Interval is defined by a [CRON expression](https://en.wikipedia.org/wiki/Cron#Overview), such as `*/5 * * * *` meaning every 5 minutes.
### Push
Data can be pushed to an integration in a webhook fashion. Data is retrieved from the JSON body of the request.

Simply add a new source like:
```json
{
  "sources": [
    {
      "type": "push",
      "settings": {}
    } 
  ]
}
```
The generated webhook URL is shown on the integration edit page.

### Fields
Fields define what data is available and how to extract it from the JSON response. It uses the expressive [JSONPath](https://en.wikipedia.org/wiki/JSONPath) syntax for evaluating paths. You can also use basic arithmetic options: `$.minutesAwake * 60 * 1000`
### Identifier
The identifier specifies the unique ID of an entity in the response. This is done to make sure that journal entries are updated rather than duplicated, if no new data is added.  
This might be a Fitbit Activity ID, a Todoist Task ID etc.

You can also use the `[DATE]` variable as an identifier, which will make sure that only one journal entry is created for each day.
  
### Multiple
When the `multiple` field is set, all data inside of the array found at the specified path will be synced to clients. Both `identifier` and `fields` will refer to an element inside of that array.
### Schema
A [schema](https://json-schema.org/) can be used to validate the JSON response before saving any data. If the schema is not matched, the data will be discarded.
### Options
Options can be defined, which will display input fields in the UI when configuring a specific entity. 
An example are the options for temperature:
```JSON
{
  "options": {
    "longitude": {
      "type": "number",
      "name": "Longitude",
      "description": "Longitude"
    },
    "latitude": {
      "type": "number",
      "name": "Latitude",
      "description": "Latitude"
    }
  }
}
```

These can then be fed into the request URL: `https://api.open-meteo.com/v1/forecast?latitude=[latitude]&longitude=[longitude]`
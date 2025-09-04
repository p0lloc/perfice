---
id: entities
sidebar_position: 2
---

# Integration entities
Integration types define an interesting entity that you wish to fetch into Perfice. Each entity fetches data from a *single* URL and can fetch multiple fields. Currently JSON is the only supported format.   

An example of an integration entity looks like this:
```json
{
    "entityType" : "sleep",
    "integrationType" : "FITBIT",
    "name" : "Sleep",
    "url" : "https://api.fitbit.com/1.2/user/-/sleep/date/#DATE#.json",
    "history" : {
        "url" : "https://api.fitbit.com/1.2/user/-/sleep/date/#START#/#DATE#.json"
    },
    "timestamp" : {
        "#date_time_notz" : "$.endTime"
    },
    "interval" : {
        "cron" : "0 */2 * * *",
        "jitter" : 0.0
    },
    "logSettings" : {
        "identifier" : "#DATE#"
    },
    "multiple" : "$.sleep",
    "identifier" : "$.logId",
    "fields" : {
        "efficiency" : {
            "name" : "Efficiency",
            "path" : "$.efficiency"
        },
        "deep_sleep" : {
            "name" : "Deep sleep minutes",
            "path" : "$.levels.summary.deep.minutes"
        },
        "light_sleep" : {
            "name" : "Light sleep minutes",
            "path" : "$.levels.summary.light.minutes"
        },
        "rem_sleep" : {
            "name" : "REM sleep minutes",
            "path" : "$.levels.summary.rem.minutes"
        },
        "minutes_asleep" : {
            "name" : "Minutes asleep",
            "path" : "$.minutesAsleep"
        },
        "minutes_awake" : {
            "name" : "Minutes awake",
            "path" : "$.minutesAwake"
        }
    },
    "schema" : {
        "type" : "object",
        "properties" : {
            "sleep" : {
                "type" : "array",
                "minItems" : 1.0
            }
        },
        "required" : [ 
            "sleep"
        ]
    },
    "options" : {}
}
```
---
id: types
sidebar_position: 1
---

# Integration types

Integration types define a specific integration provider and how to authenticate with it, an example looks like this:

```json
{
  "integrationType": "MY_INTEGRATION",
  "logo": "https://backend.com/new/integration.png",
  "name": "Integration name",
  "authentication": {
    "method": "oauth",
    "settings": {
      "authorize_url": "https://integration.com/oauth2/authorize",
      "token_url": "https://integration.com/oauth2/token",
      "client_id": "XXXXXX",
      "client_secret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "scopes": [
        "sleep",
        "activity",
        "..."
      ],
      "pkce": true
    }
  }
}

```

## Schema

| Field           | Description                               |
|-----------------|-------------------------------------------|
| integrationType | Unique identifier of the integration type |
| logo            | Logo URL to display in app                |
| name            | Name to display in app                    |
| authentication  | Authentication options (optional)         |

## Authentication methods

### OAuth

| Field         | Description                       |
|---------------|-----------------------------------|
| authorize_url | OAuth authorize url               |
| token_url     | OAuth token exchange url          |
| client_id     | Client id of OAuth app            |
| client_secret | Client secret of OAuth app        |
| scopes        | Scopes to request                 |
| pkce          | Whether to authenticate with PKCE |

### Unauthenticated

If no authentication is required, simply omit the `authentication` field for the integration type.
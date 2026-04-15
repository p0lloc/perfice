# Linear GraphQL API Reference

GraphQL queries and mutations used by `.claude/scripts/linear-api.sh`. Useful for debugging.

## API Endpoint

```
POST https://api.linear.app/graphql
Authorization: <LINEAR_API_KEY>
Content-Type: application/json
```

## Queries

### Get Issue

```graphql
query($id: String!) {
  issue(id: $id) {
    id identifier title description
    state { name }
    priority url createdAt updatedAt
    labels { nodes { name } }
    assignee { name }
  }
}
# Variables: { "id": "TEAM-66" }
# Note: Accepts both identifier ("TEAM-66") and UUID
```

### Search Issues

```graphql
query($term: String!, $limit: Int!) {
  searchIssues(term: $term, first: $limit) {
    nodes { id identifier title state { name } priority url }
  }
}
# Variables: { "term": "authentication", "limit": 10 }
```

### List Issues by Team

```graphql
query($tid: String!, $limit: Int!) {
  team(id: $tid) {
    issues(first: $limit, orderBy: updatedAt) {
      nodes { id identifier title state { name } priority url }
    }
  }
}
# Variables: { "tid": "<team-uuid>", "limit": 10 }
# Note: Requires team UUID (resolved from team key from `LINEAR_TEAM_KEY`, default `TEAM`)
```

### My Issues (filtered by assignee)

```graphql
query($tid: String!, $uid: ID!, $limit: Int!) {
  team(id: $tid) {
    issues(first: $limit, orderBy: updatedAt, filter: {
      assignee: { id: { eq: $uid } },
      state: { type: { nin: ["canceled", "completed"] } }
    }) {
      nodes { id identifier title state { name } priority url }
    }
  }
}
# Variables: { "tid": "<team-uuid>", "uid": "<viewer-uuid>", "limit": 10 }
# Note: Excludes Done/Canceled states. Uses viewer query for current user ID.
```

### Get Team by Key

```graphql
query($key: String!) {
  teams(filter: { key: { eq: $key } }) {
    nodes { id key name }
  }
}
# Variables: { "key": "TEAM" }
# Cached in /tmp/linear-TEAM-team.json (24h TTL)
```

### List Workflow States

```graphql
query($tid: ID!) {
  workflowStates(filter: { team: { id: { eq: $tid } } }) {
    nodes { id name type }
  }
}
# Variables: { "tid": "<team-uuid>" }
# Cached in /tmp/linear-TEAM-states.json (24h TTL)
```

### Semantic Search (AI)

```graphql
query($term: String!, $limit: Int) {
  semanticSearch(query: $term, maxResults: $limit) {
    results {
      type
      issue { identifier title state { name } url }
      project { name url }
      document { title url }
    }
  }
}
# Variables: { "term": "error handling in mobile", "limit": 10 }
# Note: AI-powered — understands context, not just keywords
```

### List Labels / List Users

```graphql
{ issueLabels { nodes { id name } } }
{ users { nodes { id name active } } }
# Cached in /tmp/linear-TEAM-labels.json and -users.json (24h TTL)
```

### Get Current User (Viewer)

```graphql
{ viewer { id name } }
# No variables needed — returns the authenticated user
# Used by my-issues to filter by current user
```

### Get Issue Comments

```graphql
query($id: String!) {
  issue(id: $id) {
    comments {
      nodes { id body createdAt user { name } }
    }
  }
}
# Variables: { "id": "<issue-uuid>" }
# Note: Requires UUID, script resolves from identifier
```

## Mutations

### Update Issue Fields

```graphql
mutation($id: String!, $title: String, $desc: String, $priority: Int) {
  issueUpdate(id: $id, input: {
    title: $title, description: $desc, priority: $priority
  }) {
    success
    issue { id identifier title description priority state { name } url }
  }
}
# Variables: { "id": "TEAM-66", "title": "New Title" }
# Note: Only include fields being updated. Script builds input dynamically.
```

### Create Issue

```graphql
mutation($title: String!, $desc: String, $priority: Int, $tid: String!) {
  issueCreate(input: {
    title: $title, description: $desc, priority: $priority, teamId: $tid
  }) {
    success
    issue { id identifier title url priority }
  }
}
# Variables: { "title": "...", "desc": "...", "priority": 3, "tid": "<team-uuid>" }
```

### Update Issue Status

```graphql
mutation($id: String!, $sid: String!) {
  issueUpdate(id: $id, input: { stateId: $sid }) {
    success
    issue { id identifier title state { name } url }
  }
}
# Variables: { "id": "TEAM-66", "sid": "<state-uuid>" }
# Note: State UUID resolved from name via cached state mapping
```

### Add Comment

```graphql
mutation($iid: String!, $body: String!) {
  commentCreate(input: { issueId: $iid, body: $body }) {
    success
    comment { id body createdAt }
  }
}
# Variables: { "iid": "<issue-uuid>", "body": "..." }
# Note: Requires issue UUID (NOT identifier). Script resolves via get-issue.
```

### Add/Remove Label

```graphql
mutation($id: String!, $lid: String!) {
  issueAddLabel(id: $id, labelId: $lid) {
    success
    issue { identifier title labels { nodes { name } } }
  }
}
# issueRemoveLabel has identical signature
# Variables: { "id": "TEAM-66", "lid": "<label-uuid>" }
# Note: Label UUID resolved from name via cached label mapping
```

### Assign Issue

```graphql
mutation($id: String!, $uid: String!) {
  issueUpdate(id: $id, input: { assigneeId: $uid }) {
    success
    issue { identifier title assignee { name } }
  }
}
# Variables: { "id": "TEAM-66", "uid": "<user-uuid>" }
# Note: User UUID resolved from name via cached user mapping
```

### Create Issue Relation

```graphql
mutation($iid: String!, $rid: String!, $type: IssueRelationType!) {
  issueRelationCreate(input: { issueId: $iid, relatedIssueId: $rid, type: $type }) {
    success
    issueRelation { id type issue { identifier } relatedIssue { identifier } }
  }
}
# Variables: { "iid": "<uuid>", "rid": "<uuid>", "type": "blocks" }
# Types: blocks | related | duplicate | similar
# Note: Both IDs must be UUIDs. Script resolves from identifiers.
```

### Link GitHub PR

```graphql
mutation($id: String!, $url: String!) {
  attachmentLinkGitHubPR(issueId: $id, url: $url) {
    success
    attachment { id title url }
  }
}
# Variables: { "id": "TEAM-66", "url": "https://github.com/org/repo/pull/123" }
```

## Caching

| Cache File | Contents | TTL |
|------------|----------|-----|
| `/tmp/linear-TEAM-team.json` | Team UUID for `LINEAR_TEAM_KEY` | 24h |
| `/tmp/linear-TEAM-states.json` | State name → UUID mapping | 24h |
| `/tmp/linear-TEAM-labels.json` | Label name → UUID mapping | 24h |
| `/tmp/linear-TEAM-users.json` | User name → UUID mapping | 24h |

Clear cache: `rm /tmp/linear-TEAM-*.json`

## Rate Limits

- 1500 requests/minute (more than sufficient for skill usage)

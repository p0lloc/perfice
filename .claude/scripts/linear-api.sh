#!/usr/bin/env bash
# linear-api.sh — Direct Linear GraphQL API wrapper
# Replaces the MCP + cc process chain with simple curl calls.
# Requires: LINEAR_API_KEY env var, curl, jq (both native macOS)
# Optional: LINEAR_TEAM_KEY env var (defaults to TEAM)

set -euo pipefail

API_URL="https://api.linear.app/graphql"
TEAM_KEY="${LINEAR_TEAM_KEY:-TEAM}"
CACHE_DIR="/tmp"
CACHE_TTL=86400  # 24 hours

# ── Helpers ──────────────────────────────────────────────────────────────────

die() { echo "ERROR: $*" >&2; exit 1; }

check_deps() {
  [[ -n "${LINEAR_API_KEY:-}" ]] || die "LINEAR_API_KEY not set. Get one at https://linear.app/settings/api"
  command -v curl >/dev/null || die "curl not found"
  command -v jq >/dev/null || die "jq not found"
}

gql() {
  local query="$1"
  local response
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    -d "$query")

  # Check for GraphQL errors
  local errors
  errors=$(echo "$response" | jq -r '.errors // empty')
  if [[ -n "$errors" && "$errors" != "null" ]]; then
    echo "$response" | jq -r '.errors[0].message // "Unknown GraphQL error"' >&2
    echo "$response"
    return 1
  fi

  echo "$response"
}

# ── Cache helpers ────────────────────────────────────────────────────────────

cache_fresh() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  local age=$(( $(date +%s) - $(stat -f %m "$file" 2>/dev/null || echo 0) ))
  (( age < CACHE_TTL ))
}

get_team_id() {
  local cache_file="$CACHE_DIR/linear-${TEAM_KEY}-team.json"
  if cache_fresh "$cache_file"; then
    jq -r '.id' "$cache_file"
    return
  fi

  local query
  query=$(jq -n --arg key "$TEAM_KEY" '{
    query: "query($key: String!) { teams(filter: { key: { eq: $key } }) { nodes { id key name } } }",
    variables: { key: $key }
  }')

  local result
  result=$(gql "$query") || die "Failed to fetch team ID"
  local team_id
  team_id=$(echo "$result" | jq -r '.data.teams.nodes[0].id // empty')
  [[ -n "$team_id" ]] || die "Team '$TEAM_KEY' not found"

  echo "$result" | jq '.data.teams.nodes[0]' > "$cache_file"
  echo "$team_id"
}

get_state_id() {
  local state_name="$1"
  local cache_file="$CACHE_DIR/linear-${TEAM_KEY}-states.json"

  if ! cache_fresh "$cache_file"; then
    local team_id
    team_id=$(get_team_id)
    local query
    query=$(jq -n --arg tid "$team_id" '{
      query: "query($tid: ID!) { workflowStates(filter: { team: { id: { eq: $tid } } }) { nodes { id name type } } }",
      variables: { tid: $tid }
    }')
    local result
    result=$(gql "$query") || die "Failed to fetch workflow states"
    echo "$result" | jq '.data.workflowStates.nodes' > "$cache_file"
  fi

  local state_id
  state_id=$(jq -r --arg name "$state_name" '.[] | select(.name == $name) | .id' "$cache_file")
  [[ -n "$state_id" ]] || die "State '$state_name' not found. Run: linear-api.sh list-states"
  echo "$state_id"
}

get_issue_uuid() {
  local identifier="$1"
  local result
  result=$(cmd_get_issue "$identifier")
  echo "$result" | jq -r '.data.issue.id // empty'
}

get_label_id() {
  local label_name="$1"
  local cache_file="$CACHE_DIR/linear-${TEAM_KEY}-labels.json"

  if ! cache_fresh "$cache_file"; then
    local query
    query='{"query":"{ issueLabels { nodes { id name } } }"}'
    local result
    result=$(gql "$query") || die "Failed to fetch labels"
    echo "$result" | jq '.data.issueLabels.nodes' > "$cache_file"
  fi

  local label_id
  label_id=$(jq -r --arg name "$label_name" '.[] | select(.name == $name) | .id' "$cache_file" | head -1)
  [[ -n "$label_id" ]] || die "Label '$label_name' not found. Run: linear-api.sh list-labels"
  echo "$label_id"
}

get_user_id() {
  local user_name="$1"
  local cache_file="$CACHE_DIR/linear-${TEAM_KEY}-users.json"

  if ! cache_fresh "$cache_file"; then
    local query
    query='{"query":"{ users { nodes { id name active } } }"}'
    local result
    result=$(gql "$query") || die "Failed to fetch users"
    echo "$result" | jq '.data.users.nodes' > "$cache_file"
  fi

  local user_id
  user_id=$(jq -r --arg name "$user_name" '.[] | select(.name == $name and .active == true) | .id' "$cache_file" | head -1)
  [[ -n "$user_id" ]] || die "User '$user_name' not found. Run: linear-api.sh list-users"
  echo "$user_id"
}

# ── Commands ─────────────────────────────────────────────────────────────────

cmd_get_issue() {
  local id="$1"
  local query
  query=$(jq -n --arg id "$id" '{
    query: "query($id: String!) { issue(id: $id) { id identifier title description state { name } priority url createdAt updatedAt labels { nodes { name } } assignee { name } } }",
    variables: { id: $id }
  }')
  gql "$query"
}

cmd_search() {
  local term="$1"
  local limit="${2:-10}"
  local query
  query=$(jq -n --arg term "$term" --argjson limit "$limit" '{
    query: "query($term: String!, $limit: Int!) { searchIssues(term: $term, first: $limit) { nodes { id identifier title state { name } priority url } } }",
    variables: { term: $term, limit: $limit }
  }')
  gql "$query"
}

cmd_create_issue() {
  local title="$1"
  local description="$2"
  local priority="${3:-3}"
  local team_id
  team_id=$(get_team_id)

  local query
  query=$(jq -n \
    --arg title "$title" \
    --arg desc "$description" \
    --argjson priority "$priority" \
    --arg tid "$team_id" '{
    query: "mutation($title: String!, $desc: String, $priority: Int, $tid: String!) { issueCreate(input: { title: $title, description: $desc, priority: $priority, teamId: $tid }) { success issue { id identifier title url priority } } }",
    variables: { title: $title, desc: $desc, priority: $priority, tid: $tid }
  }')
  gql "$query"
}

cmd_update_status() {
  local identifier="$1"
  local state_name="$2"
  local state_id
  state_id=$(get_state_id "$state_name")

  local query
  query=$(jq -n --arg id "$identifier" --arg sid "$state_id" '{
    query: "mutation($id: String!, $sid: String!) { issueUpdate(id: $id, input: { stateId: $sid }) { success issue { id identifier title state { name } url } } }",
    variables: { id: $id, sid: $sid }
  }')
  gql "$query"
}

cmd_add_comment() {
  local identifier="$1"
  local body="$2"

  # commentCreate requires UUID, resolve from identifier
  local uuid
  uuid=$(get_issue_uuid "$identifier")
  [[ -n "$uuid" ]] || die "Could not resolve UUID for '$identifier'"

  local query
  query=$(jq -n --arg iid "$uuid" --arg body "$body" '{
    query: "mutation($iid: String!, $body: String!) { commentCreate(input: { issueId: $iid, body: $body }) { success comment { id body createdAt } } }",
    variables: { iid: $iid, body: $body }
  }')
  gql "$query"
}

cmd_list_states() {
  local team_id
  team_id=$(get_team_id)
  local query
  query=$(jq -n --arg tid "$team_id" '{
    query: "query($tid: ID!) { workflowStates(filter: { team: { id: { eq: $tid } } }) { nodes { id name type } } }",
    variables: { tid: $tid }
  }')
  gql "$query"
}

cmd_list_issues() {
  local limit="${1:-10}"
  local team_id
  team_id=$(get_team_id)
  local query
  query=$(jq -n --arg tid "$team_id" --argjson limit "$limit" '{
    query: "query($tid: String!, $limit: Int!) { team(id: $tid) { issues(first: $limit, orderBy: updatedAt) { nodes { id identifier title state { name } priority url } } } }",
    variables: { tid: $tid, limit: $limit }
  }')
  gql "$query"
}

cmd_add_relation() {
  local issue_id="$1"
  local related_id="$2"
  local relation_type="$3"

  # Both IDs must be UUIDs
  local issue_uuid related_uuid
  issue_uuid=$(get_issue_uuid "$issue_id")
  [[ -n "$issue_uuid" ]] || die "Could not resolve UUID for '$issue_id'"
  related_uuid=$(get_issue_uuid "$related_id")
  [[ -n "$related_uuid" ]] || die "Could not resolve UUID for '$related_id'"

  local query
  query=$(jq -n --arg iid "$issue_uuid" --arg rid "$related_uuid" --arg type "$relation_type" '{
    query: "mutation($iid: String!, $rid: String!, $type: IssueRelationType!) { issueRelationCreate(input: { issueId: $iid, relatedIssueId: $rid, type: $type }) { success issueRelation { id type issue { identifier } relatedIssue { identifier } } } }",
    variables: { iid: $iid, rid: $rid, type: $type }
  }')
  gql "$query"
}

cmd_add_label() {
  local identifier="$1"
  local label_name="$2"
  local label_id
  label_id=$(get_label_id "$label_name")

  local query
  query=$(jq -n --arg id "$identifier" --arg lid "$label_id" '{
    query: "mutation($id: String!, $lid: String!) { issueAddLabel(id: $id, labelId: $lid) { success issue { identifier title labels { nodes { name } } } } }",
    variables: { id: $id, lid: $lid }
  }')
  gql "$query"
}

cmd_remove_label() {
  local identifier="$1"
  local label_name="$2"
  local label_id
  label_id=$(get_label_id "$label_name")

  local query
  query=$(jq -n --arg id "$identifier" --arg lid "$label_id" '{
    query: "mutation($id: String!, $lid: String!) { issueRemoveLabel(id: $id, labelId: $lid) { success issue { identifier title labels { nodes { name } } } } }",
    variables: { id: $id, lid: $lid }
  }')
  gql "$query"
}

cmd_assign() {
  local identifier="$1"
  local user_name="$2"
  local user_id
  user_id=$(get_user_id "$user_name")

  local query
  query=$(jq -n --arg id "$identifier" --arg uid "$user_id" '{
    query: "mutation($id: String!, $uid: String!) { issueUpdate(id: $id, input: { assigneeId: $uid }) { success issue { identifier title assignee { name } } } }",
    variables: { id: $id, uid: $uid }
  }')
  gql "$query"
}

cmd_link_pr() {
  local identifier="$1"
  local pr_url="$2"

  local query
  query=$(jq -n --arg id "$identifier" --arg url "$pr_url" '{
    query: "mutation($id: String!, $url: String!) { attachmentLinkGitHubPR(issueId: $id, url: $url) { success attachment { id title url } } }",
    variables: { id: $id, url: $url }
  }')
  gql "$query"
}

cmd_ai_search() {
  local term="$1"
  local limit="${2:-10}"
  local query
  query=$(jq -n --arg term "$term" --argjson limit "$limit" '{
    query: "query($term: String!, $limit: Int) { semanticSearch(query: $term, maxResults: $limit) { results { type issue { identifier title state { name } url } project { name url } document { title url } } } }",
    variables: { term: $term, limit: $limit }
  }')
  gql "$query"
}

cmd_update_issue() {
  local identifier="$1"
  shift

  local title="" description="" priority=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --title) title="$2"; shift 2 ;;
      --description) description="$2"; shift 2 ;;
      --priority) priority="$2"; shift 2 ;;
      *) die "Unknown flag: $1. Use --title, --description, or --priority" ;;
    esac
  done

  # Build the input object dynamically
  local input_parts=()
  [[ -n "$title" ]] && input_parts+=("title: \$title")
  [[ -n "$description" ]] && input_parts+=("description: \$desc")
  [[ -n "$priority" ]] && input_parts+=("priority: \$priority")

  [[ ${#input_parts[@]} -eq 0 ]] && die "No fields to update. Use --title, --description, or --priority"

  local input_str
  input_str=$(IFS=", "; echo "${input_parts[*]}")

  local mutation="mutation(\$id: String!"
  local vars
  vars=$(jq -n --arg id "$identifier" '{id: $id}')

  if [[ -n "$title" ]]; then
    mutation="$mutation, \$title: String!"
    vars=$(echo "$vars" | jq --arg title "$title" '. + {title: $title}')
  fi
  if [[ -n "$description" ]]; then
    mutation="$mutation, \$desc: String!"
    vars=$(echo "$vars" | jq --arg desc "$description" '. + {desc: $desc}')
  fi
  if [[ -n "$priority" ]]; then
    mutation="$mutation, \$priority: Int!"
    vars=$(echo "$vars" | jq --argjson priority "$priority" '. + {priority: $priority}')
  fi

  mutation="$mutation) { issueUpdate(id: \$id, input: { $input_str }) { success issue { id identifier title description priority state { name } url } } }"

  local query
  query=$(jq -n --arg q "$mutation" --argjson v "$vars" '{ query: $q, variables: $v }')
  gql "$query"
}

cmd_my_issues() {
  local limit="${1:-10}"

  # Get current user (viewer)
  local viewer_query='{"query":"{ viewer { id name } }"}'
  local viewer_result
  viewer_result=$(gql "$viewer_query") || die "Failed to fetch current user"
  local viewer_id
  viewer_id=$(echo "$viewer_result" | jq -r '.data.viewer.id // empty')
  [[ -n "$viewer_id" ]] || die "Could not determine current user"

  local team_id
  team_id=$(get_team_id)

  local query
  query=$(jq -n --arg tid "$team_id" --arg uid "$viewer_id" --argjson limit "$limit" '{
    query: "query($tid: String!, $uid: ID!, $limit: Int!) { team(id: $tid) { issues(first: $limit, orderBy: updatedAt, filter: { assignee: { id: { eq: $uid } }, state: { type: { nin: [\"canceled\", \"completed\"] } } }) { nodes { id identifier title state { name } priority url } } } }",
    variables: { tid: $tid, uid: $uid, limit: $limit }
  }')
  gql "$query"
}

cmd_list_comments() {
  local identifier="$1"
  local uuid
  uuid=$(get_issue_uuid "$identifier")
  [[ -n "$uuid" ]] || die "Could not resolve UUID for '$identifier'"

  local query
  query=$(jq -n --arg id "$uuid" '{
    query: "query($id: String!) { issue(id: $id) { comments { nodes { id body createdAt user { name } } } } }",
    variables: { id: $id }
  }')
  gql "$query"
}

cmd_list_labels() {
  local query='{"query":"{ issueLabels { nodes { id name } } }"}'
  gql "$query"
}

cmd_list_users() {
  local query='{"query":"{ users { nodes { id name active } } }"}'
  gql "$query"
}

# ── Main ─────────────────────────────────────────────────────────────────────

check_deps

cmd="${1:-help}"
shift || true

case "$cmd" in
  get-issue)
    [[ $# -ge 1 ]] || die "Usage: linear-api.sh get-issue <ID>"
    cmd_get_issue "$1"
    ;;
  search)
    [[ $# -ge 1 ]] || die "Usage: linear-api.sh search <term> [limit]"
    cmd_search "$1" "${2:-10}"
    ;;
  create-issue)
    title="${1:-}"
    description="${2:-}"
    # Support reading description from stdin when arg is "-"
    if [[ "$description" == "-" ]]; then
      description=$(cat)
    fi
    [[ -n "$title" ]] || die "Usage: linear-api.sh create-issue <title> <description|-|> [priority]"
    cmd_create_issue "$title" "$description" "${3:-3}"
    ;;
  update-status)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh update-status <ID> <state-name>"
    cmd_update_status "$1" "$2"
    ;;
  add-comment)
    body="${2:-}"
    # Support reading body from stdin when arg is "-"
    if [[ "${2:-}" == "-" ]]; then
      body=$(cat)
    fi
    [[ $# -ge 1 && -n "$body" ]] || die "Usage: linear-api.sh add-comment <ID> <body|->"
    cmd_add_comment "$1" "$body"
    ;;
  list-states)
    cmd_list_states
    ;;
  list-issues)
    cmd_list_issues "${1:-10}"
    ;;
  add-relation)
    [[ $# -ge 3 ]] || die "Usage: linear-api.sh add-relation <ID> <related-ID> <blocks|related|duplicate|similar>"
    cmd_add_relation "$1" "$2" "$3"
    ;;
  add-label)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh add-label <ID> <label-name>"
    cmd_add_label "$1" "$2"
    ;;
  remove-label)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh remove-label <ID> <label-name>"
    cmd_remove_label "$1" "$2"
    ;;
  assign)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh assign <ID> <user-name>"
    cmd_assign "$1" "$2"
    ;;
  link-pr)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh link-pr <ID> <github-pr-url>"
    cmd_link_pr "$1" "$2"
    ;;
  ai-search)
    [[ $# -ge 1 ]] || die "Usage: linear-api.sh ai-search <query> [limit]"
    cmd_ai_search "$1" "${2:-10}"
    ;;
  update-issue)
    [[ $# -ge 2 ]] || die "Usage: linear-api.sh update-issue <ID> --title|--description|--priority <value>"
    _ui_id="$1"; shift
    cmd_update_issue "$_ui_id" "$@"
    ;;
  my-issues)
    cmd_my_issues "${1:-10}"
    ;;
  list-comments)
    [[ $# -ge 1 ]] || die "Usage: linear-api.sh list-comments <ID>"
    cmd_list_comments "$1"
    ;;
  list-labels)
    cmd_list_labels
    ;;
  list-users)
    cmd_list_users
    ;;
  help|--help|-h)
    cat <<'USAGE'
Usage: linear-api.sh <command> [args...]

Issues:
  get-issue <ID>                            Get issue details (e.g., TEAM-66)
  search <term> [limit]                     Search issues by keyword (default: 10)
  ai-search <query> [limit]                 AI semantic search across all resources
  create-issue <title> <desc|-> [priority]  Create issue (priority 0-4, default 3)
  update-issue <ID> --title|--description|--priority <val>
                                            Update issue fields
  update-status <ID> <state>                Update issue workflow state
  add-comment <ID> <body|->                 Add comment to issue
  list-comments <ID>                        List comments on an issue
  assign <ID> <user-name>                   Assign issue to user
  add-label <ID> <label-name>               Add label to issue
  remove-label <ID> <label-name>            Remove label from issue
  add-relation <ID> <ID2> <type>            Link two issues (blocks|related|duplicate|similar)
  link-pr <ID> <github-pr-url>              Attach GitHub PR to issue

Listings:
  my-issues [limit]                         My active issues (excludes done/canceled)
  list-issues [limit]                       List recent issues
  list-states                               List workflow states
  list-labels                               List available labels
  list-users                                List team members

Use "-" as description/body to read from stdin (for multiline content).

Environment:
  LINEAR_API_KEY  Required. Get at https://linear.app/settings/api

States: Backlog | Todo | In Progress | In Review | Done | Canceled | Duplicate
Priority: 0=None 1=Urgent 2=High 3=Normal 4=Low
Relations: blocks | related | duplicate | similar
USAGE
    ;;
  *)
    die "Unknown command: $cmd. Run: linear-api.sh help"
    ;;
esac

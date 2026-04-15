---
name: cc-linear
description: >
  Execute Linear operations via direct GraphQL API — create issues, update
  status/priority/title, add comments, search tasks, manage labels, assign work,
  and link PRs. Use this skill whenever the user mentions Linear, refers to
  TEAM-* issue identifiers, says "create a ticket/issue", "move to done/in
  progress/review", "update the task status", "close the issue", "what's in our
  backlog", "assign this to", "my issues", or any project management operation
  targeting Linear. Also trigger when other skills (ct, si, sr) need to sync
  state with Linear.
---

# CC Linear

> **Announcement**: Begin with: "I'm using the **cc-linear** skill for Linear project management."

Interact with Linear via `.claude/scripts/linear-api.sh` — a direct `curl` wrapper over Linear's GraphQL API. Each command is atomic and deterministic.

## Commands

### Issues
```bash
.claude/scripts/linear-api.sh get-issue TEAM-66
.claude/scripts/linear-api.sh search "authentication" 5
.claude/scripts/linear-api.sh ai-search "error handling in mobile app" 5
.claude/scripts/linear-api.sh create-issue "Title" "Description" 3
.claude/scripts/linear-api.sh create-issue "Title" "-" 3 <<< "Multiline desc"
.claude/scripts/linear-api.sh update-issue TEAM-66 --title "New Title"
.claude/scripts/linear-api.sh update-issue TEAM-66 --description "New desc"
.claude/scripts/linear-api.sh update-issue TEAM-66 --priority 2
.claude/scripts/linear-api.sh update-status TEAM-66 "In Progress"
.claude/scripts/linear-api.sh add-comment TEAM-66 "Comment body"
.claude/scripts/linear-api.sh add-comment TEAM-66 "-" <<'EOF'
Multiline comment here
EOF
.claude/scripts/linear-api.sh list-comments TEAM-66
```

### Labels, Assignment & Relations
```bash
.claude/scripts/linear-api.sh add-label TEAM-66 "Bug"
.claude/scripts/linear-api.sh remove-label TEAM-66 "Bug"
.claude/scripts/linear-api.sh assign TEAM-66 "Alexander Basis"
.claude/scripts/linear-api.sh add-relation TEAM-66 TEAM-67 "blocks"
.claude/scripts/linear-api.sh link-pr TEAM-66 "https://github.com/org/repo/pull/123"
```

### Listings & Queries
```bash
.claude/scripts/linear-api.sh list-issues 10
.claude/scripts/linear-api.sh my-issues                    # Current user's active issues
.claude/scripts/linear-api.sh my-issues 20                 # With custom limit
.claude/scripts/linear-api.sh list-states
.claude/scripts/linear-api.sh list-labels
.claude/scripts/linear-api.sh list-users
```

## Output Formatting

The script returns raw JSON. Present results to the user clearly:

- **get-issue**: Show identifier, title, status, priority, assignee, labels, and URL
- **search / ai-search**: Numbered list with identifier, title, and status
- **create-issue**: Confirm with identifier and URL
- **update-status / update-issue**: Confirm the change (e.g., "TEAM-66: Todo → In Progress")
- **list-comments**: Show author, date, and body for each comment
- **my-issues**: Show as a compact table grouped by status
- **list-***: Show as a compact table

Always include the Linear URL so the user can click through.

## Configuration

| Setting | Value |
|---------|-------|
| Team Key | `LINEAR_TEAM_KEY` or default `TEAM` |
| API Key | `LINEAR_API_KEY` env var |

### Task States (in order)

```
Backlog → Todo → In Progress → In Review → Done | Canceled | Duplicate
```

### Priority Levels

```
0: None  1: Urgent  2: High  3: Normal (default)  4: Low
```

## Workflow Patterns

Common multi-step sequences. Each command is atomic — chain them together.

### Start Implementation
```bash
.claude/scripts/linear-api.sh update-status TEAM-66 "In Progress"
.claude/scripts/linear-api.sh add-comment TEAM-66 "Implementation started. Branch: feature/team-66-feature-name"
```

### Submit for Review
```bash
.claude/scripts/linear-api.sh update-status TEAM-66 "In Review"
.claude/scripts/linear-api.sh add-comment TEAM-66 "-" <<'EOF'
Implementation completed.
- Key changes: [list]
- Test coverage: [X]%
- PR ready for review.
EOF
```

### Task Done
```bash
.claude/scripts/linear-api.sh update-status TEAM-66 "Done"
.claude/scripts/linear-api.sh add-comment TEAM-66 "Task completed and PR merged. SHA: abc123"
```

## Cross-Skill Integration

When working with other skills, proactively suggest or perform Linear operations:

| Skill | When | Linear Action |
|-------|------|---------------|
| `/ct` | After creating task docs | `create-issue` with task title + link to task doc |
| `/si` | On implementation start | `update-status` → "In Progress" + comment with branch |
| `/sr` | After code review passes | `update-status` → "In Review" or "Done" |
| PR creation | After `gh pr create` | `link-pr` + `update-status` → "In Review" |

Don't force these — suggest them when the context is clear (e.g., a TEAM-* ID is visible in the task doc or branch name).

## Error Recovery

- If a command fails mid-sequence, retry the failed command — completed steps are idempotent.
- If "State not found", run `list-states` to refresh the cache, then retry.
- If "Label/User not found", run `list-labels` or `list-users` to check exact names.
- Clear all caches: `rm /tmp/linear-TEAM-*.json`
- Never silently swallow errors — always report failures to the user.

## References

See `references/linear-api-reference.md` for GraphQL queries used by the script.

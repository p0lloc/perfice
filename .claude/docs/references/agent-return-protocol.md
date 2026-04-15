# Agent Structured Return Protocol

> **Single source of truth** for how agents communicate results to orchestrators.
> Referenced by: `/sr`, `/si`, all review agents, `developer-agent`

---

## Protocol

Every agent MUST begin its response with a structured header:

```
## STATUS: COMPLETE | BLOCKED | FAILED
## SUMMARY: [one-line description of outcome]
## FINDINGS: [count] (for review agents: critical/major/minor counts)
```

### Field Details

| Field | Values | Description |
|-------|--------|-------------|
| `STATUS` | `COMPLETE` | Work finished successfully |
| | `BLOCKED` | Cannot proceed — dependency or unclear requirement |
| | `FAILED` | Work attempted but did not succeed |
| `SUMMARY` | Free text | One sentence describing what was accomplished or what went wrong |
| `FINDINGS` | Count string | Review agents: `0 critical, 2 major, 1 minor`. Implementation agents: total issues or `N/A` |

### Examples

**Review agent (success, no issues):**
```
## STATUS: COMPLETE
## SUMMARY: Security review passed — no vulnerabilities found in changed files
## FINDINGS: 0 critical, 0 major, 0 minor
```

**Review agent (issues found):**
```
## STATUS: COMPLETE
## SUMMARY: Code quality review found naming inconsistencies and a missing guard clause
## FINDINGS: 0 critical, 2 major, 1 minor
```

**Implementation agent (blocked):**
```
## STATUS: BLOCKED
## SUMMARY: Cannot implement criterion 3 — depends on UserService which doesn't exist yet
## FINDINGS: N/A
```

---

## Orchestrator Parsing

Orchestrators (`/sr`, `/si`) pattern-match on `## STATUS:` to determine the next action:

| Status | Orchestrator Action |
|--------|-------------------|
| `COMPLETE` | Proceed to next gate/step |
| `BLOCKED` | Log blocker, ask user for guidance or skip item |
| `FAILED` | Log failure details, attempt recovery or escalate |

---

## Adoption

Agents that already use this protocol:
- `developer-agent` (returns JSON with `status` field — maps to this protocol)
- All review agents in `/sr` GATE 5

Agents that should adopt (add header to their response):
- `automated-quality-gate`
- `spec-compliance-reviewer`
- `senior-architecture-reviewer`
- `security-code-reviewer`
- `code-quality-reviewer`
- `test-coverage-reviewer`
- `documentation-accuracy-reviewer`
- `performance-reviewer`
- `goal-verifier`
- `task-splitter`
- `task-decomposer`
- `plan-reviewer`

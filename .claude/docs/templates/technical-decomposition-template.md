> **For agentic workers:** Use `/si` to implement this task. Follow TDD (RED -> GREEN -> REFACTOR). Each step must have a failing test before production code. Update step checkboxes and test evidence during implementation, then use the completion summary for final verification evidence. See `.claude/skills/si/SKILL.md` for the full workflow.

# Technical Decomposition: [Task Name]
**Status**: Technical Review | **Created**: YYYY-MM-DD

> **Lifecycle:** `Technical Review` -> `In Progress` -> `Implementation Complete`

## Linked Inputs / Context
- Discovery: `./discovery-[feature-name].md` (if exists)
- JTBD: `./JTBD-[feature-name].md` (if exists)
- PRD / requirements: `[path-to-doc]` (if exists)
- Architecture / decision docs: `[path-to-doc]` (if relevant)
- Other inputs: [prototype, issue link, diagrams, notes]

---

## Primary Objective
[Single clear statement of what will be built technically.]

---

## Must Haves
Non-negotiable truths when this task is complete:
- [ ] [Observable behavior 1]
- [ ] [Interface, file, endpoint, or workflow truth 2]
- [ ] [Constraint or invariant 3]

---

## Test Plan (TDD - Define First)

### Test Strategy
[High-level testing approach: unit, integration, e2e, contract, migration, or focused manual verification where appropriate.]

### Test Cases to Implement

#### Test Suite 1: [Behavior Area]
**File**: `path/to/test-file`

- [ ] **TEST-001**: [Test name and what it validates]
  - **Covers**: `REQ-001`
  - **Given**: [Preconditions already in place]
  - **When**: [Action being exercised]
  - **Then**: [Observable outcome]

- [ ] **TEST-002**: [Test name and what it validates]
  - **Covers**: `REQ-002`
  - **Given**: [Preconditions already in place]
  - **When**: [Action being exercised]
  - **Then**: [Observable outcome]

#### Test Suite 2: [Behavior Area]
**File**: `path/to/test-file`

- [ ] **TEST-003**: [Test name and what it validates]
  - **Covers**: `REQ-003`
  - **Given**: [Preconditions already in place]
  - **When**: [Action being exercised]
  - **Then**: [Observable outcome]

### Verification Commands
```bash
[exact commands to run locally or in the relevant package/directory]
```

### Coverage Notes
- [Critical behaviors covered]
- [Edge cases covered]
- [Integration boundaries covered]

---

## Technical Requirements
Translate the discovery / product requirements into implementation-facing requirements. Use `REQ-XXX` IDs so tests and steps can trace back to them.

- [ ] `REQ-001`: [Specific, measurable requirement carried into implementation]
- [ ] `REQ-002`: [Specific, measurable requirement carried into implementation]
- [ ] `REQ-003`: [Specific, measurable requirement carried into implementation]

---

## Implementation Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | [Gray area or technical choice] | [Chosen approach] | [Why this is the right choice] |

If there were no meaningful gray areas, write: `No additional implementation decisions required.`

---

## Implementation Steps

> Optional: annotate truly independent steps as `Wave 1`, `Wave 2`, etc. for parallel execution.

> **Traceability Convention**: Tag each step with `[REQ-XXX]` linking to the requirement it fulfills from the discovery/JTBD/PRD doc. Steps without a requirement tag may indicate scope creep. The `/analyze` skill uses these tags to verify spec-plan alignment.

### Step 1: [High-level action name]
- [ ] Sub-step 1.1: [REQ-001] [Atomic action description]
  - **Files / modules**: `path/to/file-or-directory`
  - **What changes**:
    - [Specific change 1]
    - [Specific change 2]
    - [Specific change 3]
  - **Tests**: [Relevant test suite or command]
  - **Depends on**: [None / prior step]

### Step 2: [High-level action name]
- [ ] Sub-step 2.1: [REQ-002] [Atomic action description]
  - **Files / modules**: `path/to/file-or-directory`
  - **What changes**:
    - [Specific change 1]
    - [Specific change 2]
  - **Tests**: [Relevant test suite or command]
  - **Depends on**: [None / prior step]

---

## Dependencies / Risks / Blockers

### Dependencies
- [Libraries, APIs, services, migrations, approvals, or prerequisite work]

### Risks
- [Regression, rollout, performance, migration, or coordination risk]

### Blockers
- [Only include items that must be resolved before implementation can proceed. If none, write `None`.]

---

## Tracking / Notes (Optional)

### Tracking
- **Issue ID**: [Optional]
- **Issue URL**: [Optional]
- **Branch / PR**: [Fill branch during implementation. Add PR URL before `/sr` if PR-based review will follow.]
- **Split status**: [Single task | Split recommended | Phases created]

### Notes
[Technical context, gotchas, follow-ups, or references for implementers]

---

## Completion Summary (Refresh before review handoff)

**Implementation Complete**: [Brief summary]

### Verification Evidence
- **Commands run**: [Exact commands and outcomes]
- **Quality gate**: [Report path or concise result]
- **Goal verification**: [Verified | Not run | Blocked]
- **Known skips / caveats**: [If none, write `None`]

**Commits / PRs**: [List commit hashes or URLs]

**Deferred Follow-ups**: [Any intentionally deferred work]

---
name: analyze
description: >-
  Cross-artifact consistency check between spec documents and tech decomposition.
  Use when asked to 'analyze consistency', 'check alignment', 'verify spec matches plan',
  'traceability check', 'spec drift', 'are my docs aligned', or after /ct completes
  to verify the tech decomposition covers all requirements. Also invoked automatically
  as GATE 4 in /ct.
  NOT for code review (use /sr), NOT for code analysis (use /code-analysis),
  NOT for debugging (use /dbg).
argument-hint: [task-directory]
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

# Analyze: Cross-Artifact Consistency Check

> **Announcement**: Begin with: "I'm using the **analyze** skill for cross-artifact consistency checking."

## Purpose

Verify that the tech decomposition OUTPUT of `/ct` is fully aligned with the spec INPUT (discovery/JTBD/PRD docs). Catches drift between what was specified and what was planned — BEFORE implementation begins.

**This skill is read-only.** It reads and reports — no file writes, no agents, no code changes.

---

## Step 1: Locate Artifacts

Find the task directory and its documents:

1. **If argument provided**: match against `tasks/task-*[argument]*/`
2. **If no argument**: list recent task directories, ask user to select

**Required artifacts** (at least one spec + one plan):

| Type | Files to look for |
|------|-------------------|
| **Spec** (input) | `discovery-*.md`, `JTBD-*.md` in task directory; `PRD-*.md` in `docs/product-docs/PRD/`; `JTBD-*.md` in `docs/product-docs/JTBD/` |
| **Plan** (output) | `tech-decomposition-*.md` (or `phase-*/tech-decomposition-*.md` if split) |

**If spec docs are missing**: Report "No spec documents found — cannot verify alignment. This task was created without /nf or /product documentation." Verdict: `SKIPPED`.

**If tech decomposition is missing**: Report "No tech decomposition found — run /ct first." Verdict: `SKIPPED`.

---

## Step 2: Extract Requirements

Read all spec documents and extract a numbered list of requirements:

- From **discovery docs**: `How It Works`, `In Scope`, `Out Of Scope`, `Key Requirements`, `Constraints`, and any equivalent older sections such as Functional Requirements, Non-Functional Requirements, UI/UX Specifications, and acceptance scenarios
- From **JTBD docs**: Core Needs, Desired Outcomes
- From **PRD docs**: Functional Requirements, User Stories, Acceptance Criteria

Assign each requirement an ID: `REQ-001`, `REQ-002`, etc.

**Also extract**: any unresolved `[NEEDS CLARIFICATION: ...]` markers — these are immediate blockers.

---

## Step 3: Extract Test Cases

Read the tech decomposition's **Test Plan** section. Extract all test cases with their Given/When/Then definitions.

Assign each test case an ID: `TEST-001`, `TEST-002`, etc.

---

## Step 4: Extract Implementation Steps

Read the tech decomposition's **Implementation Steps** section. Extract all steps and sub-steps.

Note any existing `[REQ-XXX]` traceability tags already present on steps.

---

## Step 5: Build Traceability Matrix

Map the three dimensions:

```
Requirement (REQ-XXX) → Test Case (TEST-XXX) → Implementation Step (Step X.X)
```

For each requirement, determine:
- Does at least one test case verify this requirement?
- Does at least one implementation step fulfill this requirement?

For each implementation step, determine:
- Does it trace back to a requirement? (via `[REQ-XXX]` tag or semantic match)
- Does it have an associated test?

---

## Step 6: Flag Gaps

Report findings using these tags:

| Tag | Meaning | Severity |
|-----|---------|----------|
| `[UNCOVERED]` | Requirement has no test case | Major |
| `[UNTESTED]` | Implementation step has no associated test | Minor |
| `[SCOPE CREEP]` | Implementation step maps to no requirement | Major |
| `[CONFLICT]` | Requirement contradicts a tech decision or another requirement | Critical |
| `[UNRESOLVED]` | `[NEEDS CLARIFICATION]` marker not yet resolved | Critical |

---

## Step 7: Report & Verdict

Present the report to the user:

```markdown
## Consistency Analysis: [Task Name]

### Traceability Matrix

| REQ | Description | Test | Step | Status |
|-----|-------------|------|------|--------|
| REQ-001 | [brief] | TEST-001 | Step 1.1 | Covered |
| REQ-002 | [brief] | — | Step 2.1 | [UNCOVERED] |
| REQ-003 | [brief] | TEST-003 | — | [UNCOVERED] |
| — | — | — | Step 3.1 | [SCOPE CREEP] |

### Findings

- [UNCOVERED] REQ-002 "User can delete session" — no test case covers this requirement
- [SCOPE CREEP] Step 3.1 "Add caching layer" — no requirement references caching

### Verdict: ALIGNED | GAPS FOUND ([N] issues)

**Critical**: [count] | **Major**: [count] | **Minor**: [count]
```

**Verdict rules**:
- **ALIGNED**: 0 Critical, 0 Major gaps
- **GAPS FOUND**: Any Critical or Major gaps exist

**If GAPS FOUND**: Ask user via `AskUserQuestion`:
- **Fix gaps** — go back and update the tech decomposition
- **Acknowledge and proceed** — gaps are intentional or will be addressed later
- **Re-run /nf** — spec docs need revision first

---

## Related Skills

| Need | Use |
|------|-----|
| Create the tech decomposition | `/ct` |
| Feature discovery | `/nf` |
| Code review (post-implementation) | `/sr` |
| Implementation | `/si` |

---
name: ph
description: >-
  Prepare session handoff for continuation in a new conversation. Use when
  'prepare handoff', 'save progress', 'session handoff', 'I need to stop',
  'prepare for next session', 'hand off', 'write handoff', or when the user
  wants to pause mid-implementation and resume later in a fresh context window.
argument-hint: [task-directory]
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Prepare Handover Command

> **Announcement**: Begin with: "I'm using the **ph** skill to prepare a session handoff."

## PRIMARY OBJECTIVE

Capture the current implementation state into a cold-start brief (`HANDOFF.md`) so a fresh Claude session can resume work without re-exploring the codebase. This is critical when context windows run long or when work spans multiple sessions.

## WHY THIS EXISTS

`/si` Continue mode works well when the task document is perfectly up to date. In practice, handoffs happen mid-step when docs are stale — checkmarks don't reflect actual code state, recent decisions aren't documented, and the next session wastes tokens re-discovering what this session already knew.

`HANDOFF.md` solves this by capturing a point-in-time snapshot that the next session can load directly.

---

## WORKFLOW

### STEP 1: Resolve Task

1. If `$ARGUMENTS` provided, locate the task directory
2. Otherwise, detect from current branch or ask: "Which task to prepare handoff for?"
3. Read the task document (tech-decomposition)

### STEP 2: Capture Git State

```bash
# Branch and last commit
git branch --show-current
git log --oneline -5

# Working tree state
git status --short

# Uncommitted changes summary
git diff --stat
git diff --cached --stat

# Stash list
git stash list
```

### STEP 3: Capture Implementation State

1. **Identify current step**: Read task doc checkmarks — find the last checked step and the first unchecked step
2. **Reconcile with reality**: Compare task doc claims against actual code:
   - Do files mentioned in checked steps exist?
   - Do tests for checked steps pass?
   - Are there files modified but not mentioned in any step?
3. **Identify recently modified files**:
   ```bash
   git diff --name-only $(git merge-base HEAD main)..HEAD
   ```
4. **Capture test state**:
   ```bash
   cd client && npx vitest run 2>&1 | tail -20
   ```

### STEP 4: Capture Context

1. **Blockers**: Any known issues, failing tests, unresolved errors
2. **Key decisions**: Implementation choices made during this session that aren't in the task doc
3. **Deferred issues**: Pre-existing problems discovered but intentionally not fixed
4. **Gotchas**: Surprising behaviors, workarounds applied, things the next session should know

### STEP 5: Write HANDOFF.md

Write to `tasks/task-[name]/HANDOFF.md`:

```markdown
# Session Handoff

**Date**: YYYY-MM-DD
**Branch**: [branch-name]
**Last Commit**: [sha] [message]

---

## Current State

**Step in progress**: Step [N]: [description]
**Completed steps**: [list of checked steps with brief notes]
**Overall progress**: [X of Y steps complete]

## Files to Read First

Load these files to rebuild context (ordered by importance):

1. `[path/to/most-critical-file]` — [why: e.g., "main implementation file for this step"]
2. `[path/to/test-file]` — [why: e.g., "failing test that needs GREEN implementation"]
3. `[path/to/related-module]` — [why: e.g., "dependency modified in Step 2"]
4. `[path/to/task-doc]` — [why: "source of truth for requirements"]
5. `[path/to/context-file]` — [why: e.g., "database schema with new model"]

## Working Tree State

```
[git status output]
```

**Uncommitted changes**: [description of what's in progress but not committed]
**Stashes**: [any stashed work and what it contains]

## Test State

```
[test output summary — passing/failing counts]
```

**Failing tests**: [list with file:line if applicable]
**Reason**: [why they fail — e.g., "RED phase, implementation not written yet"]

## Key Decisions Made This Session

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | [what was decided] | [why] |

## Blockers & Gotchas

- [any known issues the next session should be aware of]

## Deferred Issues

- [pre-existing problems not in scope, logged here for awareness]

## Next Actions

1. [Immediate next thing to do — be specific]
2. [Then this]
3. [Then this]
```

### STEP 6: Update Task Document

1. Ensure all checked/unchecked steps accurately reflect code state
2. Add a note in the task doc: `**Handoff prepared**: See HANDOFF.md for session context`

---

## HOW `/si` CONTINUE MODE USES HANDOFF.md

When `/si` detects Continue mode, it checks for `HANDOFF.md` in the task directory:

- **If HANDOFF.md exists**: Load it first, read the "Files to Read First" section, then reconcile with task doc. This is faster and more accurate than re-exploring.
- **If HANDOFF.md is absent**: Fall back to the current behavior (scan task doc checkmarks, run tests, read recent commits).

After `/si` Continue mode successfully resumes:
- Rename `HANDOFF.md` to `HANDOFF-[date].md` (archive, don't delete — useful for debugging session boundaries)

---

## CONSTRAINTS

- **Do not commit HANDOFF.md** — it's a transient artifact for the next session, not a permanent record
- **Do not modify implementation code** — this skill only captures state, it doesn't fix things
- **Be honest about state** — if tests are failing, say so. If a step is partially done, say so. The next session needs truth, not optimism.

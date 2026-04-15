---
name: quick
description: >-
  Use when handling a small, untracked change with clear scope or a bugfix with a known root
  cause, and there is no tech-decomposition or task directory to follow. Trigger on requests like
  'quick fix', 'just do it', 'small change', or 'quick task'. NOT for new features, tracked task
  work, or changes needing formal implementation/review flow (use /si).
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Skill
---

# /quick — Lightweight Task Mode

> **Announcement**: Begin with: "I'm using the **quick** skill for a lightweight task."

Fast-path implementation with quality checks but no ceremony.

## When to Use
- Bug fixes with known root cause
- Config changes, env updates
- Small refactors (rename, extract, inline)
- Adding a validation rule, fixing a query
- Anything that touches **<5 files**, has **clear scope**, and is **not already tracked by a task doc**

## When NOT to Use (redirect)
- A `tech-decomposition` or task directory already exists → `/si`
- New feature or module → `/ct` + `/si`
- Change needs Linear tracking → `/ct` + `/si`
- Change touches >5 files → `/ct` + `/si`
- Unclear scope or multiple approaches → `/brainstorm` or `/nf`

---

## Workflow

### STEP 1: Scope Gate
Before starting, verify this is truly a quick task:
- If a `tech-decomposition` or task directory already exists, use `/si` instead.
- Count expected files to change. If >5, suggest `/ct` + `/si` instead.
- If the change requires a new module/service/table, suggest `/ct` + `/si` instead.
- If the user already wants a formal tracked implementation/review path, suggest `/si` instead.
- If the user insists, proceed — but note the risk.

### STEP 2: Quick Plan
State in **3-5 bullet points** what will change:
```
Quick plan:
- Fix: [what's wrong / what needs to change]
- Files: [list of files to modify]
- Test: [how to verify it works]
```

Get user confirmation before proceeding.

### STEP 3: Implement
- Make changes directly — no task document needed
- **Follow TDD for any logic changes** (same bright-line rules as /si):
  - Write a FAILING test first that specifies the expected behavior
  - If you wrote production code before a failing test: delete it and restart with RED
  - Implement the minimal fix to make the test pass (GREEN)
  - Verify test passes: `cd client && npx vitest run`
  - "Tests after" is not TDD — it produces confirmation tests, not specification tests
- For non-logic changes (config, docs, formatting): just make the change

### STEP 4: Verify
Run the smallest repo-appropriate verification that proves the changed behavior for the touched package(s).

Examples:

**Logic change:**
```bash
cd client && npm run check && npx vitest run
```

**Config/docs change:**
```bash
# No linter configured — skip lint-only verification
```

**Type-only change:**
```bash
cd client && npm run check
```

If the touched package uses different scripts or stronger verification is warranted, run those instead. If any check fails, fix it before proceeding.

**Evidence requirement**: Do not claim the task is done without running these checks and confirming they pass. Project hooks (for example `stop-guard.sh`) may enforce similar checks.

### STEP 4.5: De-Sloppify (if logic changes were made)
If STEP 3 included logic changes (not just config/docs), run a quick de-sloppify pass:
1. Identify changed files: `git diff --name-only`
2. Run `/simplify` skill (`Skill tool → skill: "simplify"`) — it reviews changed files for slop: console.logs from debugging, commented-out code, redundant defensive checks, dead imports. Removes them without refactoring logic.
3. If fixes applied, re-run STEP 4 verification checks.

### STEP 5: Commit
Ask user permission, then create a single conventional commit:
```
<type>(<scope>): <summary>
```

Types: `fix`, `refactor`, `chore`, `docs`, `test`

### STEP 6: Optional Handoff
- If the user only wants the quick fix applied, stop after STEP 5.
- If the change now needs a formal tracked review path and a task doc already exists, hand off to `/sr`.
- If the change needs formal review but no task doc exists, ask whether to promote the work into `/si` first.

---

## What /quick Does NOT Do
- Create task documents by default
- Create Linear issues
- Run review agents by default
- Create PRs automatically
- Update ROADMAP/STATE files

## Guardrails

Follow the shared reference: `.claude/docs/references/deviation-rules.md`

This covers: auto-fix vs ask matrix, 3-attempt limit, scope boundaries, and paralysis guard rules.

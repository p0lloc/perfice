---
name: parallelization
description: >-
  Parallelize implementation across isolated git worktrees. Use when /si identifies
  parallelizable work, the user says 'run in parallel', 'implement simultaneously',
  'parallelize these steps', or when a task has 2+ independent acceptance criteria
  touching different files/modules.
  NOT for single-threaded implementation (use /si).
allowed-tools:
  - Agent
  - AskUserQuestion
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - TodoWrite
---

# Parallel Implementation Orchestrator

> **Announcement**: Begin with: "I'm using the **parallelization** skill for parallel implementation orchestration."

Spawn scoped `developer-agent` workers in isolated git worktrees to implement independent work items simultaneously, then merge results back into the working tree.

## When to Parallelize

Parallelization helps when a task has multiple acceptance criteria that are genuinely independent — different modules, different files, no shared state. The time savings are significant (N items in ~1x time instead of Nx time), but the merge overhead adds complexity. Use this decision matrix:

| Scenario | Parallelize? |
|----------|-------------|
| Steps touch different modules/directories | Yes |
| Independent test suites for different services | Yes |
| Steps modify the same files | No — sequential |
| Step N depends on Step N-1's output | No — sequential |
| Database migrations (order matters) | No — sequential |
| Steps share test fixtures or DB state | No — sequential |
| Only 1 parallelizable item | No — not worth the overhead |

**Max concurrency**: Spawn at most **4 workers** simultaneously. Beyond that, API throughput and context quality degrade.

## Pre-flight Checks

Before spawning any workers, verify:

1. **Clean working tree**: `git status` must show no uncommitted changes. If dirty, ask the user to commit or stash first — parallel workers in worktrees branch from HEAD, so uncommitted changes would be lost.
2. **Task document exists**: The task doc must be readable and have identifiable work items.
3. **Independence verified**: Confirm selected items don't share files. Quick check: list the expected file paths for each item and look for overlaps.

## Workflow

### 1) Identify parallelizable work items

**Wave detection (preferred)**: Check the task document for wave annotations (e.g., `— **Wave 1**`, `— **Wave 2**`). If present, group steps by wave number. Execute all same-wave steps in parallel, then advance to the next wave. This is the preferred path since wave annotations are assigned by `/ct` during planning when the author has full context.

**Fallback (no waves)**: Read the task document. List all acceptance criteria / work items. Select only those that pass the decision matrix above.

Announce the plan:

> "Parallelizing items [2, 3, 5] (Wave 1) — they touch independent modules. Items [1, 4] (Wave 2) will run after Wave 1 completes."

### 2) Spawn workers in worktrees

Each worker runs in an **isolated git worktree** via the Agent tool's `isolation: "worktree"` parameter. This gives each worker its own copy of the repo — no file conflicts possible.

Spawn ALL workers in a **single assistant message** to maximize true concurrency:

```
Agent tool call 1:
  subagent_type: "developer-agent"
  isolation: "worktree"
  prompt: |
    Implement acceptance criterion [N] for the task at [task_path].

    Inputs:
    - task_document_path: [task_document_path]
    - criterion_number: [N]
    - git_writes_approved: false

    Constraints:
    - Implement ONLY criterion [N]
    - Follow TDD (RED → GREEN → REFACTOR) inside scope
    - Do NOT create git commits — just make the changes
    - Do NOT edit shared task documents
    - Return a summary with: status, files_changed, test_results, and any notes

Agent tool call 2 (same message):
  subagent_type: "developer-agent"
  isolation: "worktree"
  prompt: |
    (same structure, different criterion)
```

**Why worktrees?** Without isolation, multiple agents editing files simultaneously in the same directory would create race conditions and corrupted files. Worktrees give each agent a complete, independent copy of the repo. When the agent finishes, its worktree path and branch are returned in the result — you use these to cherry-pick the changes back.

### 3) Consolidate results

As workers complete, collect their results. Each worktree agent returns:
- The **worktree path** and **branch name** where changes were made
- A summary of what was implemented

For each completed worker:

```bash
# 1. Review what the worker changed
git -C <worktree_path> diff HEAD

# 2. If changes look correct, create a patch and apply it
git -C <worktree_path> diff HEAD > /tmp/worker-crit-N.patch
git apply /tmp/worker-crit-N.patch

# 3. Or, if the worker committed (git_writes_approved=true):
git merge <worktree_branch> --no-ff -m "feat(scope): implement criterion N"
```

**Conflict handling**: If `git apply` fails with conflicts, the items weren't truly independent. Apply the non-conflicting patches first, then handle the conflicting one manually in the main working tree.

### 4) Run validation

After all patches are applied, run the project's quality checks. Detect the project area from the task:

**Project verification:**
```bash
cd client && npm run check && npx vitest run
```

If validation fails, identify which worker's changes caused the issue and fix in the main working tree.

### 5) Update task document

After all workers' changes are applied and validated, update the task document **once**:
- Check off completed criteria
- Add changelog entries for each parallelized item
- Note which items were parallelized (useful for reviewers)

Workers must not edit shared task documents — this is the orchestrator's job, to avoid merge conflicts in docs.

## Safety Rules

- **Git writes require explicit user approval** — workers default to `git_writes_approved: false`
- **Task docs are orchestrator-owned** — workers return notes, orchestrator updates docs
- **No scope creep** — each worker implements exactly one criterion, nothing more

## Output

After consolidation, report:

- Which criteria were parallelized
- Worker summaries (status, files changed, test results)
- Any conflicts discovered and how they were resolved
- What remains to be done sequentially
- Validation results (lint, types, tests)

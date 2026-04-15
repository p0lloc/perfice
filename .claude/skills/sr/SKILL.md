---
name: sr
description: >-
  Use when asked to review code before merge or review a PR, branch, commit
  range, task path, or current working tree. Trigger on requests like
  'review PR', 'review my changes', 'review this branch', 'is this ready to
  merge', or other pre-merge review requests. Supports task/spec-aware review
  when task docs exist. NOT for addressing review comments (use /prc).
argument-hint: [task-path | PR-url | branch | range | no-arg auto-detect]
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - TodoWrite
  - Skill
  - Agent
---

# Start Review

> **Announcement**: Begin with: "I'm using the **sr** skill for universal code review."

Universal review entrypoint for task paths, PRs, branches, explicit ranges, and local working-tree drafts. Resolve the review target first, then only run checks supported by the evidence you actually have.

## When to Use
- Pre-merge code review
- "review this PR"
- "review this branch"
- "review my changes"
- "is this ready to merge?"
- Task review when a task directory or spec exists

## When NOT to Use
- Addressing review comments -> `/prc`
- General codebase exploration -> `/code-analysis`
- Implementation-plan review -> `/rip`

## STEP 1: Resolve Review Target

- Task path -> `task`
- PR URL or PR number -> `pr`
- Explicit git range -> `range`
- Branch name -> `branch`
- No arguments:
  1. If staged, unstaged, or untracked changes exist -> `working-tree`
  2. Else if current branch differs from resolved base -> `branch`
  3. Else ask what to review

## STEP 2: Detect Capabilities

Record these fields before dispatching reviewers:
- `has_task_doc`
- `has_spec`
- `has_committed_snapshot`
- `can_run_verification`
- `review_scope`

Rules:
- `task` mode may use task docs and spec compliance
- `pr`, `branch`, and `range` modes do not require task docs
- `working-tree` mode never requires a clean tree
- set `has_committed_snapshot = false` for `working-tree`; set it from resolved SHAs for committed modes
- Never claim spec compliance when no spec artifact exists
- PR descriptions or issue text do not count as spec unless the user explicitly says to treat them as the review baseline
- Cross-AI validation and Linear syncing are optional follow-ups, not default gates

## STEP 3: Resolve Base and Diff Context

Prefer base in this order:
1. PR base branch
2. Task-documented base branch
3. Current branch upstream
4. `main`
5. `master`

Compute diff context once and share it with all reviewers:
- `changed_files`
- `full_diff`
- `review_mode`
- `base_ref`
- `head_ref`
- `has_spec`

Diff rules:
- `task`, `pr`, `branch`, `range`: use committed diff from the resolved base or explicit range
- `working-tree`: use staged plus unstaged local diff, include untracked files in `changed_files`, set `base_ref = HEAD`, and set `head_ref = working-tree`
- Exclude generated files and lockfiles unless the user explicitly wants them reviewed

Do NOT force `main...HEAD` onto every review mode.

## STEP 4: Choose Scope

Use `quick` only when ALL are true:
- `<= 3` changed files
- `<= 50` diff lines
- no auth, migrations, infra, build-system, or shared framework changes

Otherwise use `full`.

## STEP 5: Review Pipeline

### 5.1 Optional Spec Gate

Run `spec-compliance-reviewer` only when `has_spec = true`.

If no spec exists, write:
`Skipped - no task/spec artifact available.`

### 5.2 Core Reviewers

Always run:
- `security-code-reviewer`
- `code-quality-reviewer`

Run `senior-architecture-reviewer` when:
- scope is `full`, or
- boundaries or dependencies changed, or
- new modules, services, or interfaces were introduced

### 5.3 Extended Reviewers

In `full` scope, also run:
- `test-coverage-reviewer`
- `documentation-accuracy-reviewer`
- `performance-reviewer`

For every skipped reviewer, write a one-line reason in that section.

## STEP 6: Verification Policy

Verification is evidence, not a prerequisite for starting review.

- `task`: prefer verification commands from the task doc; otherwise run narrow package checks
- `pr`, `branch`, `range`: run the smallest repo-appropriate checks for touched packages when safe
- `working-tree`: run only safe local checks; do NOT block review on a dirty tree

If verification is skipped or partial, record it. Missing verification is not passing verification.

## STEP 7: Prepare CR File

There is always exactly **one** Code Review file per review target. Compute `cr_file_path`:

- `task` -> `<task-directory>/code-review-[feature-name].md`
  - Extract `[feature-name]` from the task directory name by stripping the `task-YYYY-MM-DD-` prefix (e.g., `task-2026-04-02-operations-center` → `operations-center`). If the directory does not match this prefix pattern, use the full directory name as the feature name.
- `working-tree` -> `.claude/reviews/code-review-working-tree-[current-branch].md` (or `code-review-working-tree.md` if detached)
- all other non-task modes -> `.claude/reviews/code-review-[target].md` (create `.claude/reviews/` if missing)

**Sanitization:** Replace any `/` or spaces in `[current-branch]` or `[target]` with hyphens before constructing the filename.

**If `cr_file_path` already exists** (re-review): reuse it. Clear all `<!-- SECTION:xxx -->` contents back to placeholder text so agents write fresh findings. Do NOT create a second file.

**Legacy migration:** If `cr_file_path` does not exist, also check for a legacy `Code Review.md` (task mode) or `Code Review - *.md` (other modes) in the same directory. If found, rename it to the new `cr_file_path` convention before reusing.

**If no file exists at all**: create it by writing the template from `.claude/docs/templates/code-review-template.md`.

## STEP 8: Dispatch Agents

Pass `cr_file_path` to every agent so they use **File Mode**.

Dispatch agents and let each agent **Read → Edit** its own `<!-- SECTION:xxx -->` markers in `cr_file_path`. Each agent writes only within its own markers — no agent touches another agent's section.

If an agent fails or times out, write a fallback note into its section:
`*Review skipped — [agent-name] did not complete.*`

After **all** agents finish, proceed to STEP 9.

## STEP 9: Write Verdict

The orchestrator writes the remaining sections that agents do not own:

- `review-context` — fill from STEP 2 capabilities
- `summary` — synthesize a 2-5 sentence note from agent findings
- `verdict` — one of the verdicts below
- `key-findings` — consolidate actionable findings from all agents, ordered by severity
- `coverage` — record what was reviewed and what was skipped
- `verification` — record commands run and results
- `metadata` — changed files, diff source, reviewers invoked

Use the **Edit tool** to write each orchestrator section into its markers in `cr_file_path`. Do NOT overwrite the entire file — agents already wrote their sections.

Verdicts:
- `DRAFT REVIEW`: working-tree review or no immutable snapshot
- `APPROVED`: committed snapshot, sufficient coverage, `0 critical`, `0 major`
- `APPROVED WITH NOTES`: committed snapshot, `0 critical`, `0 major`, but verification or coverage is partial
- `NEEDS FIXES`: any critical or major finding

Never return `APPROVED` for an uncommitted working-tree draft.

## Common Mistakes
- Creating multiple CR files — there is always exactly ONE per review target
- Dispatching agents without `cr_file_path` (causes inline-only results, no file written)
- Overwriting `cr_file_path` with Write after agents already edited their sections
- Forcing task workflow onto every review target
- Blocking review because the branch is dirty
- Using `main...HEAD` for working-tree review
- Claiming spec compliance without a spec
- Treating skipped verification as passed verification
- Approving uncommitted drafts

## Related Skills

| Need | Use |
|------|-----|
| Address review feedback | `/prc` |
| Formal tracked implementation | `/si` |
| Explore code before reviewing | `/code-analysis` |

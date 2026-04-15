---
name: cursor-cli
description: >-
  Run Cursor CLI (Composer 2 model) for cross-AI code review or validation. Use when asked for
  'cursor review', 'ask cursor', 'cross-AI check', 'run cursor', or when another workflow
  needs cross-AI verification with a non-OpenAI/non-Anthropic perspective.
  NOT for interactive conversations (cursor is one-shot only).
allowed-tools:
  - Bash
  - Read
---

# Cursor CLI Integration Skill

> **Announcement**: Begin with: "I'm using the **cursor-cli** skill for cross-AI validation with Cursor."

Invoke Cursor CLI (Composer 2 model) for one-shot code review, approach validation, and cross-AI verification.

## Self-Update: Official Documentation

When the skill feels outdated (wrong flags, unknown model, new features), consult these
official sources to update commands and reference files:

| Resource | URL |
|---|---|
| CLI Overview | https://cursor.com/docs/cli/overview |
| Headless Mode | https://cursor.com/docs/cli/headless |
| Output Format | https://cursor.com/docs/cli/reference/output-format |
| Composer 2 Model | https://cursor.com/docs/models/cursor-composer-2 |
| Install Script | https://cursor.com/install |

Use `WebFetch` or `mcp__exa__web_search_exa` to check for updates when:
- A cursor command fails with an unknown flag error
- The user mentions a cursor feature not covered here
- It's been a while since the skill was last updated

> **Last verified**: v2026.03.20 (March 2026), pinned model `composer-2`

## Prerequisite: Update First

**Always update cursor agent CLI to latest before running.** Releases are frequent.

```bash
# Step 1: Update to latest
curl https://cursor.com/install -fsS | bash > /dev/null 2>&1

# Step 2: Verify
agent --version
```

If agent is not installed at all:
```bash
curl https://cursor.com/install -fsS | bash
```

> **Critical**: The binary is `agent`, NOT `cursor`. The `cursor` binary is the GUI app launcher (Electron) — it does not work in headless mode.

## Core Patterns

### 1. Custom Prompt (most common)

```bash
agent -p "[prompt with explicit file paths]" \
  --model composer-2 --mode=ask --trust \
  --output-format text > /tmp/cursor-result.txt 2> /dev/null \
  && echo "Cursor completed"
```
Then read with **Read tool**: `/tmp/cursor-result.txt`

### 2. Code Review

```bash
agent -p "Review these files for bugs, security issues, and improvements:
- path/to/file1.ts
- path/to/file2.ts

Check against requirements in: tasks/task-doc/tech-decomposition.md
Focus on: correctness, edge cases, error handling" \
  --model composer-2 --mode=ask --trust \
  --output-format text > /tmp/cursor-review.txt 2> /dev/null \
  && echo "Review completed"
```
Then read with **Read tool**: `/tmp/cursor-review.txt`

### 3. Background Execution (for long tasks)

For complex tasks that take 2-10 minutes:

```bash
# Use Bash tool with run_in_background=true
agent -p "[complex prompt]" \
  --model composer-2 --mode=ask --trust \
  --output-format text > /tmp/cursor-result.txt 2> /dev/null \
  && echo "Cursor completed"
```

**Workflow**:
1. Run with `run_in_background: true` on the Bash tool
2. Continue working on other tasks while cursor runs
3. You'll be notified automatically when it completes
4. Read `/tmp/cursor-result.txt` with the Read tool
5. Summarize findings to the user

## Critical Rules

### Token Optimization (mandatory)

Without redirection, Bash returns thousands of tokens of verbose output. With the redirect pattern, you get ~30 tokens.

**Pattern**: `--output-format text > /tmp/cursor-result.txt 2> /dev/null && echo "Cursor completed"`

Always read the result with the **Read tool**, never `cat`.

### Always Use `--model composer-2`

Composer 2 is Cursor's frontier in-house model (fine-tuned Kimi K2.5 with RL on long-horizon coding tasks). It provides a unique non-OpenAI/non-Anthropic perspective for cross-AI validation. Always pass `--model composer-2` explicitly.

### Always Use `--mode=ask` and `--trust`

- `--mode=ask` ensures read-only operation — Cursor will not modify any files during cross-AI validation.
- `--trust` bypasses the workspace trust prompt, which would otherwise block non-interactive execution.
- **Never** use `--force` or `--yolo` for cross-AI validation reviews.

### Cursor Has No Context From This Conversation

Cursor starts with zero context. Always include in your prompt:
- **Task/requirement file paths** — so cursor knows what to check against
- **Implementation file paths** — so cursor knows what to review
- **Directory paths** — for broader context

File paths are referenced directly in the prompt text (no `@path` syntax like Gemini).

**Example**:
```bash
agent -p "Review the implementation in:
- client/src/application/sessions/use-cases/create-session.use-case.ts
- client/src/infrastructure/web/dto/sessions/create-session.dto.ts

Check against requirements in: tasks/task-2026-01-09-feature/tech-decomposition.md
Focus on: correctness, edge cases, error handling" \
  --model composer-2 --mode=ask --trust \
  --output-format text > /tmp/cursor-result.txt 2> /dev/null
```

### One-Shot Only

Cursor runs non-interactively via `-p`. No follow-up questions, no conversation. Craft your prompt to be complete and self-contained.

### When NOT to Use

- Simple, quick tasks (overhead not worth the 1-10 min wait)
- Tasks requiring interactive conversation/refinement
- Trivial changes (typos, formatting)

## Unique Strengths

Compared to codex-cli and gemini-cli, cursor-cli offers:

- **Composer 2 model**: Fine-tuned Kimi K2.5 — a non-OpenAI/non-Anthropic model lineage, providing a genuinely different perspective in cross-AI validation
- **Explicit read-only mode**: `--mode=ask` guarantees no file modifications (enforced at CLI level)
- **Cloud agent**: `-c` flag offloads heavy tasks to Cursor's cloud infrastructure for complex analysis

## Reference Files

Read these as needed — they are NOT loaded into context automatically:

| File | When to Read |
|---|---|
| `reference.md` | Need exact flag syntax, model list, config options, or error handling |
| `templates.md` | Need a structured prompt template for a specific review type |

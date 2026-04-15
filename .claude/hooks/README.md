# Claude Code Hooks

Automated actions that fire when Claude Code edits files, runs commands, or ends a session. Unlike CLAUDE.md instructions (which Claude follows ~80% of the time), hooks execute automatically every time.

## Quick Start

This template ships with **6 hooks wired by default** (universal, zero-config) and **9 hooks ready to enable** (project-specific, need configuration).

To enable a disabled hook:
1. Open the script file — the header contains the exact JSON snippet
2. Edit the `# === CONFIGURE FOR YOUR PROJECT ===` section at the top
3. Copy the JSON snippet into `.claude/settings.json` under the correct event key

## Directory Layout

```
.claude/hooks/
├── guards/          # Safety guardrails (bash, file, sensitive, stop, analytics)
├── lifecycle/       # Session lifecycle (auto-commit on stop)
├── lint/            # Format on write (Prettier, etc.)
├── logging/         # Audit trail (command logger)
├── metrics/         # Cost tracking
├── paralysis/       # Analysis paralysis detection
├── testing/         # Test after edit, test before PR
├── typecheck/       # TypeScript type checking
├── validation/      # Pre-commit checks
├── logs/            # Runtime state files (gitignored)
└── README.md
```

## Hook Events Reference

| Event | When it fires | Use for |
|---|---|---|
| `PreToolUse` | Before Claude executes a tool | Blocking: exit 2 to deny the action |
| `PostToolUse` | After Claude executes a tool | Feedback: surface errors via additionalContext |
| `Stop` | When Claude finishes a response | Cleanup, logging, verification |

## Active by Default

These hooks are wired in `settings.json` and work in any project without configuration.

| Hook | Event | Script | What it does |
|---|---|---|---|
| Pre-commit validation | PreToolUse (Bash) | `validation/pre-commit-validation.py` | Blocks commits with syntax errors or merge conflicts |
| Command logger | PreToolUse (Bash) | `logging/command-logger.py` | Logs every shell command to `.claude/hooks/logs/commands.jsonl` |
| Sensitive file guard | PreToolUse (Write\|Edit) | `guards/sensitive-file-guard.py` | Blocks writes to `.env`, `.pem`, `.key`, lock files, `.git/` |
| Gemini plan review | PostToolUse (ExitPlanMode) | `scripts/review-plan-gemini.sh` | Auto-reviews plans with Gemini when exiting plan mode |
| Paralysis guard | PostToolUse | `paralysis/read-counter.py` | Warns after 5+ consecutive reads without writing |
| Cost tracker | Stop | `metrics/cost-tracker.py` | Logs session token costs to `~/.claude/metrics/costs.jsonl` |

---

## Available Hooks (Enable for Your Project)

### Bash Guard

Blocks dangerous shell commands: `rm -rf` on protected dirs, destructive DB commands, enforces test variants. Universal rules (git force-push, curl\|sh) are always active.

- **File:** `guards/bash-guard.sh`
- **Event:** PreToolUse → Bash
- **Blocking:** Yes
- **Configure:** `PROTECTED_DIRS`, `DB_DANGER_PATTERN`, `TEST_SILENT_PATTERN`

```json
{
  "matcher": "Bash",
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/bash-guard.sh"}]
}
```

### File Guard

Blocks edits that violate project architecture: protected file workflows, layer boundaries, naming conventions, logging standards.

- **File:** `guards/file-guard.sh`
- **Event:** PreToolUse → Write|Edit
- **Blocking:** Yes
- **Configure:** `PROTECTED_FILE_PATTERN`, `CORE_LAYER_PATH`, `CORE_FORBIDDEN_IMPORTS`, `CONSOLE_LOG_BLOCKED`

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/file-guard.sh"}]
}
```

### Lint on Write

Auto-formats files after every Write/Edit using Prettier (or any formatter). Runs from the target subdirectory's root where the formatter is installed.

- **File:** `lint/lint-on-write.py`
- **Event:** PostToolUse → Write|Edit
- **Blocking:** No
- **Configure:** `LINT_TARGETS` (subdirs), `LINT_EXTENSIONS`, `FORMAT_CMD`

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/lint/lint-on-write.py"}]
}
```

### TypeScript Typecheck on Write

Runs `tsc --noEmit` after editing TypeScript files. Uses file-hash caching to avoid redundant runs. Surfaces errors as additionalContext.

- **File:** `typecheck/ts-typecheck-on-write.py`
- **Event:** PostToolUse → Write|Edit
- **Blocking:** No
- **Configure:** `TYPECHECK_TARGET` (subdir with tsconfig.json), `TYPECHECK_CMD`

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/typecheck/ts-typecheck-on-write.py", "timeout": 60}]
}
```

### Test After Edit

Runs your test suite after source file edits. Implements cooldown to avoid running on every rapid edit. Non-blocking — surfaces failures via additionalContext.

- **File:** `testing/test-after-edit.py`
- **Event:** PostToolUse → Write|Edit
- **Blocking:** No
- **Configure:** `TEST_CMD`, `SOURCE_DIRS`, `SOURCE_EXTENSIONS`, `COOLDOWN_SECONDS`

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-after-edit.py", "timeout": 120}]
}
```

### Test Before PR

Blocks PR creation unless tests (and optionally build) pass. Only triggers on `gh pr create` commands.

- **File:** `testing/test-before-pr.sh`
- **Event:** PreToolUse → Bash
- **Blocking:** Yes
- **Configure:** `TEST_CMD`, `BUILD_CMD` (empty to skip build check)

```json
{
  "matcher": "Bash",
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-before-pr.sh", "timeout": 120}]
}
```

### Stop Verification

Once-per-24h reminder to verify files exist, tests pass, and build succeeds before stopping. Fires on session end.

- **File:** `guards/stop-guard.sh`
- **Event:** Stop
- **Blocking:** Yes (first time only, then 24h cooldown)
- **Configure:** `VERIFY_FILES`, `VERIFY_TESTS`, `VERIFY_BUILD`, `TEST_CMD`, `BUILD_CMD`

```json
{
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/stop-guard.sh"}]
}
```

### Analytics Reminder

Prompts to add analytics events when editing screen/page files. Soft block with a configurable reminder message.

- **File:** `guards/analytics-reminder.sh`
- **Event:** PostToolUse → Write|Edit
- **Blocking:** Soft
- **Configure:** `SCREEN_FILE_PATTERN`, `REMINDER_MESSAGE`

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/analytics-reminder.sh"}]
}
```

### Auto-Commit on Stop

Commits all uncommitted changes when a session ends. Does NOT push. Use with caution — some teams prefer manual, intentional commits.

- **File:** `lifecycle/auto-commit-on-stop.sh`
- **Event:** Stop
- **Blocking:** No
- **Configure:** `COMMIT_MSG_PREFIX`, `SKIP_CI`, `STAGE_ALL`

```json
{
  "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/lifecycle/auto-commit-on-stop.sh"}]
}
```

---

## Example: Full NestJS Monorepo Setup

Complete `hooks` section for a project with `backend/` (NestJS + Prisma) and `mobile-app/` (React Native):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/validation/pre-commit-validation.py", "timeout": 30},
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/logging/command-logger.py"},
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/bash-guard.sh"},
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-before-pr.sh", "timeout": 120}
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/guards/sensitive-file-guard.py"},
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/file-guard.sh"}
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/scripts/review-plan-gemini.sh", "timeout": 300}
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/lint/lint-on-write.py"},
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/typecheck/ts-typecheck-on-write.py", "timeout": 60},
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-after-edit.py", "timeout": 120},
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/analytics-reminder.sh"}
        ]
      },
      {
        "hooks": [
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/paralysis/read-counter.py"}
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/metrics/cost-tracker.py"},
          {"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/stop-guard.sh"}
        ]
      }
    ]
  }
}
```

## Conventions

- **Scripts:** kebab-case (`pre-commit-validation.py`)
- **Directories:** lowercase (`validation/`)
- **Exit codes:** `0` = allow, `2` = block (with error message to stderr)
- **Headers:** Every script starts with a standardized docblock (purpose, event, matcher, blocking, wired, config, enable snippet)
- **State files:** Go in `hooks/logs/` (gitignored)
- **Python scripts:** Use `python3` prefix in settings.json command for portability

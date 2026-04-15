#!/bin/bash
# Bash Guard — Block dangerous shell commands before execution.
#
# Event:     PreToolUse
# Matcher:   Bash
# Blocking:  Yes (exit 2 blocks the command)
# Wired:     Yes
#
# Universal rules (always active): rm -rf on root/home, git reset --hard,
# git push --force, git clean, pipe-to-shell (curl|sh, wget|bash).
# Project-specific rules (configurable): protected directories, database
# commands, test command enforcement.
#
# Configuration:
#   PROTECTED_DIRS       — pipe-separated dir names to protect from rm -rf
#   DB_DANGER_PATTERN    — regex for destructive DB commands, empty to disable
#   DB_SAFE_CMD          — suggested safe alternative for DB changes
#   TEST_SILENT_PATTERN  — regex for test commands that need silent variant, empty to disable
#   TEST_SILENT_SUFFIX   — suffix to suggest
#
# To enable, add to .claude/settings.json hooks.PreToolUse:
#   {
#     "matcher": "Bash",
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/bash-guard.sh"}]
#   }

set -euo pipefail

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
PROTECTED_DIRS="node_modules\|client/src\|server"  # pipe-separated dirs to protect from rm -rf
DB_DANGER_PATTERN=""                                 # no ORM — MongoDB direct driver, no destructive migration commands to guard
DB_SAFE_CMD=""                                       # N/A
DB_MIGRATE_PATTERN=""                                # N/A
DB_MIGRATE_SAFE_FLAG=""                              # N/A
TEST_SILENT_PATTERN=""                               # no silent test variant configured
TEST_SILENT_SUFFIX=""

# --- Read command from stdin ---
COMMAND=$(jq -r '.tool_input.command')

# ============================================================
# UNIVERSAL RULES (always active, not configurable)
# ============================================================

# Block rm -rf on root or home directory
if echo "$COMMAND" | grep -qE 'rm[[:space:]]+(-rf|-fr)[[:space:]]+(\/|~)[[:space:]]*$'; then
  echo "BLOCKED: rm -rf targets root or home directory." >&2
  exit 2
fi

# Block rm -rf . (current directory wipe)
if echo "$COMMAND" | grep -qE 'rm[[:space:]]+(-rf|-fr)[[:space:]]+\.[[:space:]]*$'; then
  echo "BLOCKED: rm -rf targets current directory." >&2
  exit 2
fi

# Block git reset --hard
if echo "$COMMAND" | grep -qE 'git[[:space:]]+reset[[:space:]]+--hard'; then
  echo "BLOCKED: git reset --hard discards all uncommitted changes. Use 'git stash' to save changes first." >&2
  exit 2
fi

# Block git push --force / -f
if echo "$COMMAND" | grep -qE 'git[[:space:]]+push[[:space:]]+.*(-f|--force)'; then
  echo "BLOCKED: git push --force can overwrite remote history. Use --force-with-lease for safer force push." >&2
  exit 2
fi

# Block git clean -fd / -fx
if echo "$COMMAND" | grep -qE 'git[[:space:]]+clean[[:space:]]+.*-[a-z]*[fx]'; then
  echo "BLOCKED: git clean permanently removes untracked files. Use 'git clean -n' to preview first." >&2
  exit 2
fi

# Block pipe-to-shell patterns (curl|sh, wget|bash)
if echo "$COMMAND" | grep -qE '(curl|wget)[[:space:]].*\|[[:space:]]*(sh|bash|zsh)'; then
  echo "BLOCKED: Piping remote content to shell is dangerous. Download first, review, then execute." >&2
  exit 2
fi

# ============================================================
# PROJECT-SPECIFIC RULES (configurable via constants above)
# ============================================================

# Rule: rm -rf on protected directories
if [ -n "$PROTECTED_DIRS" ]; then
  if echo "$COMMAND" | grep -qE 'rm[[:space:]]+(-rf|-fr)[[:space:]]' && echo "$COMMAND" | grep -qE "($PROTECTED_DIRS)"; then
    echo "BLOCKED: rm -rf targets protected directory. Use 'mv <path> ~/.Trash/' instead." >&2
    exit 2
  fi
fi

# Rule: destructive database commands
if [ -n "$DB_DANGER_PATTERN" ]; then
  if echo "$COMMAND" | grep -qE "$DB_DANGER_PATTERN"; then
    echo "BLOCKED: Destructive database command. Use: $DB_SAFE_CMD" >&2
    exit 2
  fi
fi

# Rule: database migration without safe flag
if [ -n "$DB_MIGRATE_PATTERN" ]; then
  if echo "$COMMAND" | grep -qE "$DB_MIGRATE_PATTERN" && ! echo "$COMMAND" | grep -q "$DB_MIGRATE_SAFE_FLAG"; then
    echo "BLOCKED: Database migration without $DB_MIGRATE_SAFE_FLAG. Use: $DB_SAFE_CMD" >&2
    exit 2
  fi
fi

# Rule: test command enforcement (require silent variant)
if [ -n "$TEST_SILENT_PATTERN" ]; then
  if echo "$COMMAND" | grep -qE "$TEST_SILENT_PATTERN" && ! echo "$COMMAND" | grep -q "$TEST_SILENT_SUFFIX"; then
    echo "BLOCKED: Use silent test variant. Add '$TEST_SILENT_SUFFIX' to the test command." >&2
    exit 2
  fi
fi

exit 0

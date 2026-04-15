#!/bin/bash
# File Guard — Block edits that violate project architecture or conventions.
#
# Event:     PreToolUse
# Matcher:   Write|Edit
# Blocking:  Yes (exit 2 blocks the edit)
# Wired:     Yes
#
# Enforces: protected file workflows, architecture layer boundaries.
# Console.log blocking and interface naming are DISABLED for this project.
#
# Configuration:
#   PROTECTED_FILE_PATTERN    — regex for files needing special workflow, empty to disable
#   PROTECTED_FILE_MESSAGE    — message when blocked
#   CORE_LAYER_PATH           — path substring identifying core/domain layer
#   CORE_FORBIDDEN_IMPORTS    — regex for imports forbidden in core layer
#   INTERFACE_NAMING_ENABLED  — enforce interface naming convention (true/false)
#   CONSOLE_LOG_BLOCKED       — block console.log in favor of framework logger (true/false)
#
# To enable, add to .claude/settings.json hooks.PreToolUse:
#   {
#     "matcher": "Write|Edit",
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/file-guard.sh"}]
#   }

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
PROTECTED_FILE_PATTERN=""                                                       # no protected files
PROTECTED_FILE_MESSAGE=""                                                       # N/A
CORE_LAYER_PATH="/model/"                                                       # model layer should stay pure
CORE_FORBIDDEN_IMPORTS="@perfice/db\|@perfice/stores\|@perfice/views\|@perfice/services"  # model must not import from higher layers
INTERFACE_NAMING_ENABLED=false
INTERFACE_PATH_FILTER=""
CONSOLE_LOG_BLOCKED=false
CONSOLE_LOG_PATH_FILTER=""
CONSOLE_LOG_ALTERNATIVE=""

# --- Read input ---
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // .tool_input.content // ""')

# ============================================================
# Rule: Protected file workflow
# ============================================================
if [ -n "$PROTECTED_FILE_PATTERN" ]; then
  if echo "$FILE_PATH" | grep -qE "$PROTECTED_FILE_PATTERN"; then
    echo "BLOCKED: $PROTECTED_FILE_MESSAGE" >&2
    exit 2
  fi
fi

# ============================================================
# Rule: Architecture layer violation
# ============================================================
if [ -n "$CORE_LAYER_PATH" ]; then
  if echo "$FILE_PATH" | grep -q "$CORE_LAYER_PATH"; then
    if echo "$CONTENT" | grep -qE "$CORE_FORBIDDEN_IMPORTS"; then
      echo "BLOCKED: Infrastructure import in Model layer. Model must remain pure (types only). Use dependency inversion instead." >&2
      exit 2
    fi
  fi
fi

# --- Rules below apply only to .ts files ---
echo "$FILE_PATH" | grep -q '\.ts$' || exit 0

# ============================================================
# Rule: Interface naming convention
# ============================================================
if [ "$INTERFACE_NAMING_ENABLED" = true ]; then
  if echo "$FILE_PATH" | grep -q "$INTERFACE_PATH_FILTER"; then
    if echo "$CONTENT" | perl -ne 'exit 1 if /export\s+interface\s+(?!I[A-Z])[A-Z]\w+/' 2>/dev/null; [ $? -eq 1 ]; then
      echo "BLOCKED: Interface must start with 'I' prefix (e.g. IUserRepository)." >&2
      exit 2
    fi
  fi
fi

# ============================================================
# Rule: No console.log — use framework Logger
# ============================================================
if [ "$CONSOLE_LOG_BLOCKED" = true ]; then
  if echo "$FILE_PATH" | grep -q "$CONSOLE_LOG_PATH_FILTER"; then
    if echo "$CONTENT" | grep -vE '^\s*//' | grep -qE 'console\.(log|warn|error|info|debug)\('; then
      echo "BLOCKED: $CONSOLE_LOG_ALTERNATIVE" >&2
      exit 2
    fi
  fi
fi

exit 0

#!/bin/bash
# Test Before PR — Block PR creation unless tests (and optionally build) pass.
#
# Event:     PreToolUse
# Matcher:   Bash
# Blocking:  Yes (exit 2 blocks the PR creation)
# Wired:     Yes
#
# Only triggers on commands containing "gh pr create".
# Runs the test suite and optionally the build before allowing PR creation.
#
# Configuration:
#   TEST_CMD   — test command
#   BUILD_CMD  — build/typecheck command, empty to skip
#   SKIP_TEST_BEFORE_PR — set env var to "true" to bypass for WIP PRs
#
# To enable, add to .claude/settings.json hooks.PreToolUse:
#   {
#     "matcher": "Bash",
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-before-pr.sh", "timeout": 120}]
#   }

set -euo pipefail

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
TEST_CMD="cd client && npx vitest run"
BUILD_CMD="cd client && npm run check"  # typecheck before PR

# --- Allow bypass via env var ---
if [ "${SKIP_TEST_BEFORE_PR:-false}" = "true" ]; then
  exit 0
fi

# --- Only trigger on gh pr create ---
COMMAND=$(jq -r '.tool_input.command // ""')
if ! echo "$COMMAND" | grep -q 'gh pr create'; then
  exit 0
fi

# --- Run tests ---
echo "Running tests before PR creation..." >&2
if ! eval "$TEST_CMD" 2>&1 | tail -20; then
  echo "BLOCKED: Tests are failing. Fix all test failures before creating a PR." >&2
  exit 2
fi

# --- Run build (optional) ---
if [ -n "$BUILD_CMD" ]; then
  echo "Running build check..." >&2
  if ! eval "$BUILD_CMD" 2>&1 | tail -10; then
    echo "BLOCKED: Build is failing. Fix build errors before creating a PR." >&2
    exit 2
  fi
fi

echo "All checks passed. Proceeding with PR creation." >&2
exit 0

#!/bin/bash
# Stop Verification — Remind to verify work before ending a session.
#
# Event:     Stop
# Matcher:   (none)
# Blocking:  Yes (exit 2 blocks the first stop, fires once per 24h)
# Wired:     Yes
#
# Fires once per session (24h TTL). Reminds the agent to verify that
# files exist, tests pass, and build succeeds before stopping.
#
# Configuration:
#   VERIFY_FILES  — remind to check file existence (true/false)
#   VERIFY_TESTS  — remind to run tests (true/false)
#   VERIFY_BUILD  — remind to check build (true/false)
#   TEST_CMD      — test command to suggest
#   BUILD_CMD     — build command to suggest
#
# To enable, add to .claude/settings.json hooks.Stop:
#   {
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/stop-guard.sh"}]
#   }

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
VERIFY_FILES=true
VERIFY_TESTS=true
VERIFY_BUILD=true
TEST_CMD="cd client && npx vitest run"
BUILD_CMD="cd client && npm run build"

# --- Once-per-session: skip if already fired within 24h ---
STATE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/logs"
STATE_FILE="$STATE_DIR/.stop-guard-fired"

if [ -f "$STATE_FILE" ]; then
  FILE_AGE=$(( $(date +%s) - $(stat -f %m "$STATE_FILE" 2>/dev/null || echo 0) ))
  if [ "$FILE_AGE" -lt 86400 ]; then
    exit 0
  fi
fi

# Mark as fired
mkdir -p "$STATE_DIR"
touch "$STATE_FILE"

# --- Build verification message ---
echo "VERIFICATION CHECK: Before stopping, confirm your claims:" >&2

STEP=1
if [ "$VERIFY_FILES" = true ]; then
  echo "$STEP. Files exist: ls <file> for every file you created/modified" >&2
  STEP=$((STEP + 1))
fi
if [ "$VERIFY_TESTS" = true ]; then
  echo "$STEP. Tests pass: $TEST_CMD — confirm exit code 0" >&2
  STEP=$((STEP + 1))
fi
if [ "$VERIFY_BUILD" = true ]; then
  echo "$STEP. Build succeeds: $BUILD_CMD" >&2
fi

exit 2

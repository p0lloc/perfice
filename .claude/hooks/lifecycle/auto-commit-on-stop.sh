#!/bin/bash
# Auto-Commit on Stop — Commit all uncommitted changes when Claude's session ends.
#
# Event:     Stop
# Matcher:   (none)
# Blocking:  No (always exit 0)
# Wired:     No (opinionated — enable only if your team wants auto-commits)
#
# Checks for uncommitted changes, stages everything, and commits locally.
# Does NOT push — pushing WIP is too aggressive for a template default.
#
# Configuration:
#   COMMIT_MSG_PREFIX — commit message prefix (default: "wip: auto-commit from Claude session")
#   SKIP_CI           — append [skip ci] to commit message (default: true)
#   STAGE_ALL         — stage all changes including untracked (default: true)
#
# To enable, add to .claude/settings.json hooks.Stop:
#   {
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/lifecycle/auto-commit-on-stop.sh"}]
#   }

set -euo pipefail

# === CONFIGURE FOR YOUR PROJECT ===
COMMIT_MSG_PREFIX="wip: auto-commit from Claude session"
SKIP_CI=true
STAGE_ALL=true

# --- Check for changes ---
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  # No changes to commit
  exit 0
fi

# --- Stage changes ---
if [ "$STAGE_ALL" = true ]; then
  git add -A
else
  git add -u  # Only tracked files
fi

# --- Build commit message ---
MSG="$COMMIT_MSG_PREFIX"
if [ "$SKIP_CI" = true ]; then
  MSG="$MSG [skip ci]"
fi

# --- Commit ---
if ! git diff --cached --quiet; then
  git commit -m "$MSG" --no-verify 2>/dev/null || true
fi

exit 0

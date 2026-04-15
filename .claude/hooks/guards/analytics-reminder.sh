#!/bin/bash
# Analytics Reminder — Prompt to add analytics events for new screens/pages.
#
# Event:     PostToolUse
# Matcher:   Write|Edit
# Blocking:  Soft (outputs a reminder, does not exit 2)
# Wired:     No — DISABLED (no analytics SDK detected in this project)
#
# When editing files that match the screen pattern, outputs a reminder to
# check analytics coverage.
#
# Configuration:
#   SCREEN_FILE_PATTERN  — regex matching screen/page files that need analytics
#   REMINDER_MESSAGE     — the reminder text to display
#
# To enable, add to .claude/settings.json hooks.PostToolUse:
#   {
#     "matcher": "Write|Edit",
#     "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/analytics-reminder.sh"}]
#   }

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
SCREEN_FILE_PATTERN=""  # DISABLED — empty pattern means this hook never triggers
REMINDER_MESSAGE=""

# --- Read file path from stdin ---
FILE_PATH=$(jq -r '.tool_input.file_path // ""')

if [ -n "$SCREEN_FILE_PATTERN" ] && echo "$FILE_PATH" | grep -qE "$SCREEN_FILE_PATTERN"; then
  jq -n --arg msg "$REMINDER_MESSAGE" '{
    decision: "block",
    reason: $msg
  }'
fi

exit 0

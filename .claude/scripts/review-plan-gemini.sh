#!/bin/bash
# Review plan with Gemini CLI (PostToolUse hook for ExitPlanMode)
# Injects review directly into the plan file

# Don't use set -e to handle errors gracefully
# set -e

# Debug logging
LOG_FILE="/tmp/gemini-hook-debug.log"
echo "=== $(date) ===" >> "$LOG_FILE"

# Read JSON from stdin
INPUT=$(cat)
echo "INPUT: $INPUT" >> "$LOG_FILE"

# Extract tool name and check if it's ExitPlanMode
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
echo "TOOL_NAME: $TOOL_NAME" >> "$LOG_FILE"

# Only process ExitPlanMode
if [ "$TOOL_NAME" != "ExitPlanMode" ]; then
  echo "Skipping non-ExitPlanMode tool" >> "$LOG_FILE"
  exit 0
fi

# Extract plan content from tool_response.plan
PLAN_CONTENT=$(echo "$INPUT" | jq -r '.tool_response.plan // empty' 2>/dev/null)
PLAN_FILE=$(echo "$INPUT" | jq -r '.tool_response.filePath // empty' 2>/dev/null)

echo "PLAN_FILE: $PLAN_FILE" >> "$LOG_FILE"

# Exit if no plan content
if [ -z "$PLAN_CONTENT" ] || [ "$PLAN_CONTENT" = "null" ]; then
  echo "No plan content found" >> "$LOG_FILE"
  exit 0
fi

# Validate plan file exists
if [ -z "$PLAN_FILE" ] || [ ! -f "$PLAN_FILE" ]; then
  echo "Plan file not found: $PLAN_FILE" >> "$LOG_FILE"
  echo '{"systemMessage": "Plan file not found"}'
  exit 0
fi

echo "Starting Gemini review..." >> "$LOG_FILE"

# Create temporary file for prompt
PROMPT_FILE=$(mktemp)
trap "rm -f $PROMPT_FILE" EXIT

# Detect project context from coding-conventions skill (if configured)
CONVENTIONS_FILE="$(dirname "$0")/../skills/coding-conventions/SKILL.md"
if [ -f "$CONVENTIONS_FILE" ]; then
  # Extract tech stack info from the conventions file
  FRAMEWORK=$(grep "^\- \*\*Framework\*\*:" "$CONVENTIONS_FILE" | sed 's/.*: //')
  ARCHITECTURE=$(grep "^\- \*\*Architecture\*\*:" "$CONVENTIONS_FILE" | sed 's/.*: //')
  LANGUAGE=$(grep "^\- \*\*Language\*\*:" "$CONVENTIONS_FILE" | sed 's/.*: //')
  ORM=$(grep "^\- \*\*ORM\*\*:" "$CONVENTIONS_FILE" | sed 's/.*: //')

  PROJECT_CONTEXT="- Tech stack: ${FRAMEWORK:-Unknown framework}, ${LANGUAGE:-Unknown language}${ORM:+, $ORM}
- Architecture: ${ARCHITECTURE:-Not specified}"
else
  PROJECT_CONTEXT="- Tech stack: See project documentation
- Architecture: See project documentation"
fi

# Write prompt to temp file (avoids shell escaping issues)
cat > "$PROMPT_FILE" << PROMPT_HEADER
You are reviewing an implementation plan for a software project.

CONTEXT:
${PROJECT_CONTEXT}

PLAN TO REVIEW:
PROMPT_HEADER

# Append plan content
echo "$PLAN_CONTENT" >> "$PROMPT_FILE"

# Append review criteria
cat >> "$PROMPT_FILE" << 'PROMPT_FOOTER'

REVIEW CRITERIA:
- Missing edge cases or error handling
- Security concerns (auth, validation, injection)
- Performance issues (N+1 queries, missing indexes)
- Architecture violations
- Testability concerns

OUTPUT FORMAT (markdown):
### Summary
[1-2 sentences overall assessment]

### Issues Found
- [Issue with severity: HIGH/MEDIUM/LOW]

### Recommendations
- [Actionable improvement]

Be concise. Focus on actionable items only. No fluff.
PROMPT_FOOTER

echo "Prompt file created: $PROMPT_FILE" >> "$LOG_FILE"

# Run Gemini synchronously using file input
# Capture stdout and stderr separately
GEMINI_STDERR_FILE=$(mktemp)
REVIEW=$(gemini --model gemini-3-pro-preview "$(cat "$PROMPT_FILE")" --output-format text 2>"$GEMINI_STDERR_FILE")
GEMINI_EXIT_CODE=$?

# Log stderr for debugging
if [ -s "$GEMINI_STDERR_FILE" ]; then
  echo "Gemini stderr:" >> "$LOG_FILE"
  cat "$GEMINI_STDERR_FILE" >> "$LOG_FILE"
fi
rm -f "$GEMINI_STDERR_FILE"

echo "Gemini exit code: $GEMINI_EXIT_CODE" >> "$LOG_FILE"
echo "Review preview: ${REVIEW:0:200}..." >> "$LOG_FILE"

# Check if Gemini returned a critical error (not just stderr noise)
# Only fail on actual API errors, not extension warnings
if [ $GEMINI_EXIT_CODE -ne 0 ]; then
  echo "Gemini failed with exit code $GEMINI_EXIT_CODE" >> "$LOG_FILE"
  echo '{"systemMessage": "Gemini review failed"}'
  exit 0
fi

# Check for quota/rate limit issues in the actual response
if echo "$REVIEW" | grep -qi "quota exceeded\|rate limit exceeded\|API error"; then
  echo "Gemini review skipped due to quota/rate limit" >> "$LOG_FILE"
  echo '{"systemMessage": "Gemini review skipped: rate limit"}'
  exit 0
fi

# Check if review is empty
if [ -z "$REVIEW" ]; then
  echo "Gemini returned empty review" >> "$LOG_FILE"
  echo '{"systemMessage": "Gemini review empty"}'
  exit 0
fi

# Append review to the plan file
echo "" >> "$PLAN_FILE"
echo "---" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"
echo "## Gemini Review" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"
echo "_Generated: $(date +%Y-%m-%d\ %H:%M:%S)_" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"
echo "$REVIEW" >> "$PLAN_FILE"

echo "Review appended to plan file" >> "$LOG_FILE"

# Return result to Claude with additionalContext
jq -n \
  --arg review "$REVIEW" \
  --arg file "$(basename "$PLAN_FILE")" \
  '{"additionalContext": ("## Gemini Plan Review\n\nReview added to: " + $file + "\n\n" + $review)}'

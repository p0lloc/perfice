#!/usr/bin/env python3
"""
Command Logger — Audit trail of every shell command Claude runs.

Event:     PreToolUse
Matcher:   Bash
Blocking:  No (always exit 0)
Wired:     Yes (default in settings.json)

Appends a JSONL row for each Bash command to a local log file.
Scrubs common secret patterns (API keys, tokens, passwords) before logging.

Configuration:
  LOG_PATH         — where to write the JSONL log (default: .claude/hooks/logs/commands.jsonl)
  SCRUB_SECRETS    — whether to redact secret-like patterns (default: True)

To enable, add to .claude/settings.json hooks.PreToolUse:
  {
    "matcher": "Bash",
    "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/logging/command-logger.py"}]
  }
"""

import json
import os
import re
import sys
from datetime import datetime, timezone

# === CONFIGURE ===
LOG_PATH = os.path.join(
    os.environ.get("CLAUDE_PROJECT_DIR", "."),
    ".claude", "hooks", "logs", "commands.jsonl"
)
SCRUB_SECRETS = True

# Patterns that look like secrets in CLI commands
SECRET_PATTERNS = [
    (r'(?i)(api[_-]?key|token|secret|password|passwd|pwd|auth)\s*[=:]\s*\S+', r'\1=***REDACTED***'),
    (r'(?i)(-H|--header)\s+["\']?Authorization:\s*Bearer\s+\S+', r'\1 "Authorization: Bearer ***REDACTED***"'),
    (r'(?i)(-u|--user)\s+\S+:\S+', r'\1 ***:REDACTED***'),
    (r'(?i)export\s+(API[_A-Z]*KEY|TOKEN|SECRET|PASSWORD)[=]\S+', r'export \1=***REDACTED***'),
]


def scrub(command: str) -> str:
    """Redact secret-like patterns from a command string."""
    if not SCRUB_SECRETS:
        return command
    result = command
    for pattern, replacement in SECRET_PATTERNS:
        result = re.sub(pattern, replacement, result)
    return result


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")
    if not command:
        sys.exit(0)

    row = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "session_id": input_data.get("session_id", "unknown"),
        "command": scrub(command),
        "description": tool_input.get("description", ""),
        "cwd": input_data.get("cwd", ""),
    }

    try:
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, "a") as f:
            f.write(json.dumps(row) + "\n")
    except Exception:
        pass

    sys.exit(0)


if __name__ == "__main__":
    main()

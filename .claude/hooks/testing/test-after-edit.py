#!/usr/bin/env python3
"""
Test After Edit — Run tests after source file changes, surface failures.

Event:     PostToolUse
Matcher:   Write|Edit
Blocking:  No (always exit 0, surfaces failures via additionalContext)
Wired:     Yes

Implements a cooldown to avoid running tests on every rapid edit.
After cooldown expires, the next edit triggers a test run.

Configuration:
  TEST_CMD           — test command as list (default: ["npm", "run", "test:silent"])
  SOURCE_DIRS        — subdirectories to watch (default: ["src"])
  SOURCE_EXTENSIONS  — file extensions to trigger on (default: (".ts", ".tsx", ".py"))
  TEST_TIMEOUT       — max seconds for test run (default: 60)
  COOLDOWN_SECONDS   — min seconds between test runs (default: 30)

To enable, add to .claude/settings.json hooks.PostToolUse:
  {
    "matcher": "Write|Edit",
    "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/testing/test-after-edit.py", "timeout": 120}]
  }
"""

import json
import os
import subprocess
import sys
import time

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
TEST_CMD = ["bash", "-c", "cd client && npx vitest run"]  # runs vitest from client dir
SOURCE_DIRS = ["client/src"]  # watch client source files
SOURCE_EXTENSIONS = (".ts", ".tsx", ".svelte")  # TypeScript + Svelte files
TEST_TIMEOUT = 60
COOLDOWN_SECONDS = 30

# Internal state
STATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "logs", ".test-last-run.json"
)


def should_trigger(file_path: str, project_dir: str) -> bool:
    """Check if the edited file is a source file we care about."""
    if not file_path.endswith(SOURCE_EXTENSIONS):
        return False
    # Skip test files themselves
    basename = os.path.basename(file_path)
    if any(p in basename for p in (".test.", ".spec.", "__test__")):
        return False
    # Check if file is in a watched source directory
    try:
        rel = os.path.relpath(file_path, project_dir)
    except ValueError:
        return False
    return any(rel.startswith(d) for d in SOURCE_DIRS)


def is_cooldown_active() -> bool:
    """Check if we're still in cooldown from the last test run."""
    try:
        with open(STATE_PATH, "r") as f:
            state = json.load(f)
        last_run = state.get("last_run", 0)
        return (time.time() - last_run) < COOLDOWN_SECONDS
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        return False


def update_state():
    """Record that we just ran tests."""
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, "w") as f:
        json.dump({"last_run": time.time()}, f)


def run_tests(project_dir: str) -> tuple[bool, str]:
    """Execute the test command. Returns (passed, output)."""
    try:
        result = subprocess.run(
            TEST_CMD,
            cwd=project_dir,
            capture_output=True,
            text=True,
            timeout=TEST_TIMEOUT,
        )
        output = (result.stdout + "\n" + result.stderr).strip()
        # Truncate to avoid context bloat
        lines = output.split("\n")
        if len(lines) > 30:
            output = "\n".join(lines[-30:]) + f"\n... (showing last 30 of {len(lines)} lines)"
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Tests timed out after {TEST_TIMEOUT}s"
    except FileNotFoundError:
        return True, ""  # Test command not found — skip silently
    except Exception as e:
        return True, ""  # Don't block on unexpected errors


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    if tool_name not in ("Write", "Edit"):
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", input_data.get("cwd", os.getcwd()))

    if not file_path or not should_trigger(file_path, project_dir):
        sys.exit(0)

    if is_cooldown_active():
        sys.exit(0)

    passed, output = run_tests(project_dir)
    update_state()

    if not passed and output:
        result = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"**Tests failed after editing {os.path.basename(file_path)}:**\n```\n{output}\n```\nFix the failing tests before proceeding."
            }
        }
        print(json.dumps(result))

    sys.exit(0)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
TypeScript Typecheck on Write — Run tsc after editing .ts/.tsx files.

Event:     PostToolUse
Matcher:   Write|Edit
Blocking:  No (always exit 0, surfaces errors via additionalContext)
Wired:     Yes

Uses a file-hash cache to avoid re-running tsc when nothing changed.
Cache expires after 5 minutes to force periodic re-checks.

Configuration:
  TYPECHECK_TARGET      — subdirectory containing tsconfig.json
  TYPECHECK_CMD         — typecheck command as list
  TYPECHECK_EXTENSIONS  — file extensions to trigger on
  TYPECHECK_TIMEOUT     — max seconds for typecheck run

To enable, add to .claude/settings.json hooks.PostToolUse:
  {
    "matcher": "Write|Edit",
    "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/typecheck/ts-typecheck-on-write.py", "timeout": 60}]
  }
"""

import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
TYPECHECK_TARGET = "client"  # subdirectory with tsconfig.json
TYPECHECK_CMD = ["npm", "run", "check"]  # svelte-check + tsc
TYPECHECK_EXTENSIONS = (".ts", ".tsx", ".svelte")  # file extensions to trigger on
TYPECHECK_TIMEOUT = 30  # seconds

# Cache file to avoid re-running tsc on unchanged state
CACHE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "logs", ".tsc-cache.json"
)
CACHE_TTL = 300  # 5 minutes


def is_target_file(file_path: str, project_dir: str) -> bool:
    """Check if file is a TypeScript file under the target directory."""
    if not file_path.endswith(TYPECHECK_EXTENSIONS):
        return False

    if not TYPECHECK_TARGET:
        return False

    file_abs = Path(file_path).resolve()
    target_dir = Path(project_dir) / TYPECHECK_TARGET

    try:
        file_abs.relative_to(target_dir)
        return True
    except ValueError:
        return False


def get_file_hash(file_path: str) -> str:
    """Get MD5 hash of file content for cache comparison."""
    try:
        with open(file_path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()
    except (IOError, OSError):
        return ""


def should_skip_cache(file_path: str) -> bool:
    """Check if we can skip tsc because file hasn't changed since last check."""
    try:
        if not os.path.exists(CACHE_PATH):
            return False

        with open(CACHE_PATH, "r") as f:
            cache = json.load(f)

        if time.time() - cache.get("timestamp", 0) > CACHE_TTL:
            return False

        current_hash = get_file_hash(file_path)
        return current_hash == cache.get("last_file_hash")

    except (json.JSONDecodeError, IOError, OSError):
        return False


def update_cache(file_path: str, has_errors: bool) -> None:
    """Update the tsc result cache."""
    try:
        os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
        cache = {
            "timestamp": time.time(),
            "last_file_hash": get_file_hash(file_path),
            "last_file": file_path,
            "had_errors": has_errors,
        }
        with open(CACHE_PATH, "w") as f:
            json.dump(cache, f)
    except (IOError, OSError):
        pass


def run_typecheck(project_dir: str) -> tuple[bool, str]:
    """Run the typecheck command. Returns (success, output)."""
    target_dir = os.path.join(project_dir, TYPECHECK_TARGET)

    try:
        result = subprocess.run(
            TYPECHECK_CMD,
            cwd=target_dir,
            capture_output=True,
            text=True,
            timeout=TYPECHECK_TIMEOUT,
        )

        if result.returncode == 0:
            return True, ""

        errors = result.stdout.strip() or result.stderr.strip()
        lines = errors.split("\n")
        if len(lines) > 20:
            errors = "\n".join(lines[:20]) + f"\n... and {len(lines) - 20} more errors"

        return False, errors

    except subprocess.TimeoutExpired:
        return False, f"tsc timed out ({TYPECHECK_TIMEOUT}s)"
    except FileNotFoundError:
        return True, ""  # Command not found — skip silently
    except Exception:
        return True, ""  # Don't block on unexpected errors


def main() -> None:
    """Main hook execution."""
    try:
        input_data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", input_data.get("cwd", os.getcwd()))

    if tool_name not in ("Write", "Edit"):
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path or not is_target_file(file_path, project_dir):
        sys.exit(0)

    if should_skip_cache(file_path):
        sys.exit(0)

    success, errors = run_typecheck(project_dir)
    update_cache(file_path, not success)

    if not success and errors:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": f"**TypeScript type errors detected:**\n```\n{errors}\n```\nFix these type errors before proceeding."
            }
        }
        print(json.dumps(output))

    sys.exit(0)


if __name__ == "__main__":
    main()

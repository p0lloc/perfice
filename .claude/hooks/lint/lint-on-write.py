#!/usr/bin/env python3
"""
Lint on Write — Auto-format files after Write/Edit operations.

Event:     PostToolUse
Matcher:   Write|Edit
Blocking:  No (always exit 0)
Wired:     No — DISABLED (no formatter configured for this project)

Runs a formatter (default: Prettier) on source files within configured
subdirectories. Each subdirectory should have its own package.json with
the formatter installed.

Configuration:
  LINT_TARGETS      — subdirectories containing their own package.json + formatter
  LINT_EXTENSIONS   — file extensions to format
  SKIP_PATTERNS     — substrings in path to skip
  FORMAT_CMD        — formatter command as list (run from target subdir root)

To enable, add to .claude/settings.json hooks.PostToolUse:
  {
    "matcher": "Write|Edit",
    "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/lint/lint-on-write.py"}]
  }
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional, Tuple

# === CONFIGURE FOR YOUR PROJECT (updated by /setup wizard) ===
LINT_TARGETS = ["client"]  # subdirs with package.json + formatter
LINT_EXTENSIONS = (".ts", ".tsx", ".svelte")  # file extensions to format
SKIP_PATTERNS = ("node_modules", "dist/", ".svelte-kit/")  # path substrings to skip
FORMAT_CMD = []  # DISABLED — no formatter configured. Set to e.g. ["npx", "prettier", "--write"] to enable
FORMAT_TIMEOUT = 15  # seconds


def is_target_file(file_path: str) -> bool:
    """Check if file has a targeted extension."""
    return file_path.endswith(LINT_EXTENSIONS)


def get_target_dir(file_path: str, project_dir: str) -> Optional[str]:
    """Return the target directory if file is inside a configured subdirectory."""
    file_abs = Path(file_path).resolve()

    for subdir in LINT_TARGETS:
        target = Path(project_dir) / subdir
        try:
            file_abs.relative_to(target)
            return str(target)
        except ValueError:
            continue

    return None


def should_process_file(file_path: str, project_dir: str) -> Tuple[bool, Optional[str]]:
    """Determine if file should be formatted. Returns (should_process, target_dir)."""
    if not FORMAT_CMD:
        return False, None

    if not is_target_file(file_path):
        return False, None

    target_dir = get_target_dir(file_path, project_dir)
    if not target_dir:
        return False, None

    # Skip generated/vendored files
    if any(skip in file_path for skip in SKIP_PATTERNS):
        return False, None

    return True, target_dir


def format_file(file_path: str, cwd: str) -> Tuple[bool, str]:
    """Auto-format file. Returns (success, message)."""
    try:
        result = subprocess.run(
            FORMAT_CMD + [file_path],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=FORMAT_TIMEOUT,
        )

        file_name = Path(file_path).name
        if result.returncode == 0:
            return True, f"formatted {file_name}"
        else:
            err = result.stderr.strip()[:200]
            return False, f"failed on {file_name} — {err}"

    except subprocess.TimeoutExpired:
        return False, f"timed out ({FORMAT_TIMEOUT}s)"
    except FileNotFoundError:
        return False, "formatter not found (check FORMAT_CMD)"
    except Exception as e:
        return False, f"error — {e}"


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
    if not file_path:
        sys.exit(0)

    should_process, target_dir = should_process_file(file_path, project_dir)
    if not should_process or not target_dir:
        sys.exit(0)

    if not Path(file_path).exists():
        sys.exit(0)

    success, msg = format_file(file_path, target_dir)
    formatter_name = FORMAT_CMD[0] if FORMAT_CMD else "formatter"
    print(f"{'✓' if success else '✗'} {formatter_name}: {msg}", file=sys.stderr)

    sys.exit(0)


if __name__ == "__main__":
    main()

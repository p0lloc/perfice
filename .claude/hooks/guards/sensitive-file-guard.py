#!/usr/bin/env python3
"""
Sensitive File Guard — Block writes to secrets, lock files, and .git internals.

Event:     PreToolUse
Matcher:   Write|Edit
Blocking:  Yes (exit 2 blocks the write)
Wired:     Yes (default in settings.json)

Normalizes incoming file paths (resolves symlinks, .., etc.) before matching
against the protected patterns list, preventing path traversal bypasses.

Configuration:
  PROTECTED_PATTERNS — list of fnmatch-style patterns to block writes to
  Override via env var: HOOK_SENSITIVE_FILES (comma-separated, appended to defaults)

To enable, add to .claude/settings.json hooks.PreToolUse:
  {
    "matcher": "Write|Edit",
    "hooks": [{"type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/guards/sensitive-file-guard.py"}]
  }
"""

import fnmatch
import json
import os
import sys

# === CONFIGURE FOR YOUR PROJECT ===
PROTECTED_PATTERNS = [
    ".env",
    ".env.*",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "*.keystore",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "Gemfile.lock",
    ".git/*",
]


def get_patterns() -> list:
    """Build pattern list from defaults + optional env var override."""
    patterns = list(PROTECTED_PATTERNS)
    extra = os.environ.get("HOOK_SENSITIVE_FILES", "")
    if extra:
        patterns.extend(p.strip() for p in extra.split(",") if p.strip())
    return patterns


def normalize_path(file_path: str, project_dir: str) -> str:
    """Resolve and normalize a file path to prevent traversal bypasses."""
    if os.path.isabs(file_path):
        resolved = os.path.normpath(file_path)
    else:
        resolved = os.path.normpath(os.path.join(project_dir, file_path))
    # Return path relative to project dir for pattern matching
    try:
        return os.path.relpath(resolved, project_dir)
    except ValueError:
        return resolved


def is_protected(rel_path: str, patterns: list) -> str | None:
    """Check if a relative path matches any protected pattern. Returns matched pattern or None."""
    basename = os.path.basename(rel_path)
    for pattern in patterns:
        # Match against full relative path
        if fnmatch.fnmatch(rel_path, pattern):
            return pattern
        # Match against basename only (e.g., "*.pem" matches "certs/server.pem")
        if fnmatch.fnmatch(basename, pattern):
            return pattern
        # Match against path components (e.g., ".git/*" matches ".git/config")
        if "/" in pattern and fnmatch.fnmatch(rel_path, pattern):
            return pattern
    return None


def main():
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "") or tool_input.get("path", "")
    if not file_path:
        sys.exit(0)

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", input_data.get("cwd", os.getcwd()))
    rel_path = normalize_path(file_path, project_dir)
    patterns = get_patterns()

    matched = is_protected(rel_path, patterns)
    if matched:
        print(
            f"BLOCKED: '{rel_path}' matches protected pattern '{matched}'. "
            f"Explain why this edit is necessary, or use a Bash command if appropriate "
            f"(e.g., npm install to regenerate lock files).",
            file=sys.stderr,
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()

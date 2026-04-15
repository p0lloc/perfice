#!/usr/bin/env python3
"""
Pre-Commit Validation — Quick checks before git commit.

Event:     PreToolUse
Matcher:   Bash (internally filters for git commit commands only)
Blocking:  Yes (exit 2 blocks commit on critical errors)
Wired:     Yes (default in settings.json)

Runs fast validation before commits:
- Python syntax errors (blocks commit)
- Merge conflict markers (blocks commit)
- Debug code detection (warning only)
- Large file detection (warning only)

Supports .py, .ts, .tsx files. Skips files in .claude/hooks/ to avoid
false positives from pattern strings in the hook scripts themselves.

Configuration:
  No configuration required — works universally.
  Debug logging to .claude/hooks/logs/hook-debug.log (1MB rotation).

To enable, add to .claude/settings.json hooks.PreToolUse:
  {
    "matcher": "Bash",
    "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/validation/pre-commit-validation.py", "timeout": 30}]
  }
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# Цвета для вывода
class Colors:
    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    CYAN = "\033[0;36m"
    NC = "\033[0m"  # No Color


def log_debug(message: str, data: Optional[Dict] = None, force: bool = False) -> None:
    """
    Логирование для отладки с ротацией.

    Args:
        message: Сообщение для логирования
        data: Дополнительные данные (словарь)
        force: Принудительное логирование (даже если не git commit)
    """
    debug_log = Path(".claude/hooks/logs/hook-debug.log")

    # Проверяем размер лога и ротируем если нужно
    try:
        if debug_log.exists():
            size = debug_log.stat().st_size
            max_size = 1 * 1024 * 1024  # 1MB

            if size > max_size:
                # Ротация: переименовываем старый лог
                backup_log = debug_log.with_suffix(".log.old")
                if backup_log.exists():
                    backup_log.unlink()  # Удаляем старый backup
                debug_log.rename(backup_log)
    except Exception:
        pass

    try:
        with open(debug_log, "a") as f:
            f.write(f"[PRE-COMMIT] {message}\n")
            if data:
                f.write(f"  Data: {json.dumps(data, indent=2)}\n")
    except Exception:
        pass


def extract_files_from_command(command: str) -> List[str]:
    """
    Извлечь файлы из команды git add.

    Поддерживает паттерны:
    - git add file1.py file2.py
    - git add "path with spaces/file.py"
    - git add .
    - git add -A
    """
    files: List[str] = []

    # Ищем git add в команде
    add_match = re.search(r'git\s+add\s+([^&|;]+)', command)
    if not add_match:
        return files

    add_args = add_match.group(1).strip()

    # Если git add . или git add -A, получаем все модифицированные файлы
    if add_args in (".", "-A", "--all"):
        try:
            result = subprocess.run(
                ["git", "diff", "--name-only", "HEAD"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode == 0:
                files = [
                    line.strip()
                    for line in result.stdout.split("\n")
                    if line.strip()
                    and any(line.strip().endswith(ext) for ext in (".py", ".ts", ".tsx"))
                    and os.path.exists(line.strip())
                ]
        except Exception as e:
            log_debug(f"Error getting all files: {e}")
        return files

    # Парсим список файлов (с поддержкой кавычек)
    # Простой парсер для "file 1.py" file2.py 'file 3.py'
    in_quotes = False
    current_file = ""
    quote_char = None

    for char in add_args:
        if char in ('"', "'") and not in_quotes:
            in_quotes = True
            quote_char = char
        elif char == quote_char and in_quotes:
            in_quotes = False
            quote_char = None
            if current_file.strip():
                files.append(current_file.strip())
            current_file = ""
        elif in_quotes:
            current_file += char
        elif char.isspace():
            if current_file.strip():
                files.append(current_file.strip())
            current_file = ""
        else:
            current_file += char

    # Добавляем последний файл
    if current_file.strip():
        files.append(current_file.strip())

    # Фильтруем .py и .ts/.tsx файлы, проверяем существование
    supported_files = [
        f for f in files
        if (f.endswith(".py") or f.endswith(".ts") or f.endswith(".tsx"))
        and os.path.exists(f)
    ]

    return supported_files


def get_staged_files(command: str = "") -> List[str]:
    """
    Получить список Python и TypeScript файлов для проверки.

    Сначала пытается извлечь из команды git add,
    потом проверяет staged files в git index.
    """
    supported_exts = (".py", ".ts", ".tsx")

    # Метод 1: Извлечь из команды
    if command:
        files_from_command = extract_files_from_command(command)
        if files_from_command:
            log_debug(f"Extracted {len(files_from_command)} files from command")
            return files_from_command

    # Метод 2: Проверить staged files
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0:
            files = [
                line.strip()
                for line in result.stdout.split("\n")
                if line.strip() and any(line.strip().endswith(ext) for ext in supported_exts)
            ]
            if files:
                log_debug(f"Found {len(files)} staged files in git index")
            return files
        return []
    except Exception as e:
        log_debug(f"Error getting staged files: {e}")
        return []


def check_python_syntax(files: List[str]) -> Tuple[bool, List[str]]:
    """Проверка синтаксиса Python (TS syntax checked by separate typecheck hook)."""
    errors = []
    for file_path in files:
        if not file_path.endswith(".py"):
            continue
        if not os.path.exists(file_path):
            continue
        try:
            result = subprocess.run(
                ["python3", "-m", "py_compile", file_path],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode != 0:
                errors.append(f"Syntax error in {file_path}:\n{result.stderr}")
        except subprocess.TimeoutExpired:
            errors.append(f"Timeout checking syntax in {file_path}")
        except Exception as e:
            log_debug(f"Error checking syntax for {file_path}: {e}")

    return len(errors) == 0, errors


def check_merge_conflicts(files: List[str]) -> Tuple[bool, List[str]]:
    """Проверка маркеров конфликтов слияния."""
    conflicts = []
    conflict_markers = [b"<<<<<<<", b"=======", b">>>>>>>"]

    for file_path in files:
        # Skip hook files - they contain marker strings for detection
        if ".claude/hooks/" in file_path:
            continue
        if not os.path.exists(file_path):
            continue
        try:
            with open(file_path, "rb") as f:
                content = f.read()
                for marker in conflict_markers:
                    if marker in content:
                        conflicts.append(f"Merge conflict markers found in {file_path}")
                        break
        except Exception as e:
            log_debug(f"Error checking merge conflicts in {file_path}: {e}")

    return len(conflicts) == 0, conflicts


def check_debug_code(files: List[str]) -> Tuple[bool, List[str]]:
    """Проверка debug-кода (предупреждение, не блокировка)."""
    # Python debug patterns
    python_patterns = [
        (r"pdb\.set_trace\(\)", "pdb.set_trace()"),
        (r"\bbreakpoint\(\)", "breakpoint()"),
        (r"import pdb", "import pdb"),
        (r'print\s*\(\s*["\']DEBUG', 'print("DEBUG...'),
    ]
    # TypeScript debug patterns
    ts_patterns = [
        (r"\bconsole\.log\(", "console.log()"),
        (r"\bdebugger\b", "debugger statement"),
    ]
    # Shared patterns
    shared_patterns = [
        (r"//\s*TODO:\s*remove", "// TODO: remove"),
        (r"#\s*TODO:\s*remove", "# TODO: remove"),
        (r"//\s*FIXME:\s*remove", "// FIXME: remove"),
        (r"#\s*FIXME:\s*remove", "# FIXME: remove"),
    ]

    warnings = []
    for file_path in files:
        # Skip hook files - they contain pattern strings for detection
        if ".claude/hooks/" in file_path:
            continue
        if not os.path.exists(file_path):
            continue

        # Select patterns based on file type
        is_ts = file_path.endswith((".ts", ".tsx"))
        is_py = file_path.endswith(".py")
        active_patterns = shared_patterns[:]
        if is_py:
            active_patterns.extend(python_patterns)
        if is_ts:
            active_patterns.extend(ts_patterns)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                for pattern, description in active_patterns:
                    if re.search(pattern, content):
                        warnings.append(f"{file_path}: Found {description}")
        except Exception as e:
            log_debug(f"Error checking debug code in {file_path}: {e}")

    return True, warnings  # True потому что это предупреждение, не ошибка


def check_large_files() -> Tuple[bool, List[str]]:
    """Проверка размера файлов."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode != 0:
            return True, []

        warnings = []
        max_size = 500 * 1024  # 500KB

        for file_path in result.stdout.strip().split("\n"):
            if not file_path or not os.path.exists(file_path):
                continue
            try:
                size = os.path.getsize(file_path)
                if size > max_size:
                    size_kb = size // 1024
                    warnings.append(f"{file_path} ({size_kb}KB) - unusually large")
            except Exception:
                pass

        return True, warnings  # True потому что это предупреждение
    except Exception as e:
        log_debug(f"Error checking file sizes: {e}")
        return True, []


def format_feedback(
    syntax_ok: bool,
    syntax_errors: List[str],
    conflicts_ok: bool,
    conflicts: List[str],
    debug_ok: bool,
    debug_warnings: List[str],
    files_ok: bool,
    file_warnings: List[str],
) -> str:
    """Форматирование feedback для Claude."""
    parts = []

    # Заголовок
    parts.append(
        f"{Colors.CYAN}═════════════════════════════════════════════════════════{Colors.NC}"
    )
    parts.append(
        f"{Colors.YELLOW}⚡ Claude Pre-Commit Validation (Quick Checks){Colors.NC}"
    )
    parts.append(
        f"{Colors.CYAN}═════════════════════════════════════════════════════════{Colors.NC}\n"
    )

    has_errors = not syntax_ok or not conflicts_ok
    has_warnings = len(debug_warnings) > 0 or len(file_warnings) > 0

    # Критические ошибки
    if not syntax_ok:
        parts.append(f"{Colors.RED}❌ SYNTAX ERRORS FOUND:{Colors.NC}")
        for error in syntax_errors:
            parts.append(f"  {error}")
        parts.append("")

    if not conflicts_ok:
        parts.append(f"{Colors.RED}❌ MERGE CONFLICTS DETECTED:{Colors.NC}")
        for conflict in conflicts:
            parts.append(f"  {conflict}")
        parts.append("")

    # Предупреждения
    if debug_warnings:
        parts.append(f"{Colors.YELLOW}⚠️  DEBUG CODE DETECTED:{Colors.NC}")
        for warning in debug_warnings:
            parts.append(f"  {warning}")
        parts.append("")

    if file_warnings:
        parts.append(f"{Colors.YELLOW}⚠️  LARGE FILES DETECTED:{Colors.NC}")
        for warning in file_warnings:
            parts.append(f"  {warning}")
        parts.append("")

    # Итоговое сообщение
    if has_errors:
        parts.append(
            f"{Colors.RED}❌ CRITICAL ISSUES FOUND - FIX BEFORE COMMITTING{Colors.NC}"
        )
        parts.append(
            f"{Colors.CYAN}ℹ️  Fix these issues and try committing again{Colors.NC}"
        )
    elif has_warnings:
        parts.append(
            f"{Colors.YELLOW}⚠️  WARNINGS FOUND - CONSIDER REVIEWING{Colors.NC}"
        )
        parts.append(
            f"{Colors.GREEN}✅ No critical errors, you may proceed with commit{Colors.NC}"
        )
        parts.append(
            f"{Colors.CYAN}ℹ️  Git pre-commit hook will run full checks (formatting, linting, tests){Colors.NC}"
        )
    else:
        parts.append(f"{Colors.GREEN}✅ All quick checks passed!{Colors.NC}")
        parts.append(
            f"{Colors.CYAN}ℹ️  Git pre-commit hook will run full checks next{Colors.NC}"
        )

    parts.append(
        f"\n{Colors.CYAN}═════════════════════════════════════════════════════════{Colors.NC}"
    )

    return "\n".join(parts)


def main() -> None:
    """Основная функция hook."""
    try:
        # Читаем input от Claude
        input_data = json.load(sys.stdin)

        tool_name = input_data.get("tool_name", "")
        tool_input = input_data.get("tool_input", {})
        command = tool_input.get("command", "")

        # Проверяем, что это git commit (без логирования для не-commit команд)
        if tool_name != "Bash":
            sys.exit(0)

        if not re.search(r"\bgit\s+commit\b", command):
            sys.exit(0)

        # Теперь мы знаем что это git commit - начинаем логировать
        log_debug("Git commit detected", input_data)

        # Пропускаем если --no-verify
        if "--no-verify" in command:
            log_debug("--no-verify flag detected, allowing commit")
            sys.exit(0)

        log_debug("Running quick pre-commit checks")

        # Получаем список staged файлов
        staged_files = get_staged_files(command)

        if not staged_files:
            log_debug("No Python/TypeScript files to check")
            sys.exit(0)

        log_debug(f"Checking {len(staged_files)} files", {"files": staged_files})

        # Выполняем проверки
        syntax_ok, syntax_errors = check_python_syntax(staged_files)
        conflicts_ok, conflicts = check_merge_conflicts(staged_files)
        debug_ok, debug_warnings = check_debug_code(staged_files)
        files_ok, file_warnings = check_large_files()

        # Формируем feedback
        feedback = format_feedback(
            syntax_ok,
            syntax_errors,
            conflicts_ok,
            conflicts,
            debug_ok,
            debug_warnings,
            files_ok,
            file_warnings,
        )

        # Определяем действие
        has_critical_errors = not syntax_ok or not conflicts_ok

        if has_critical_errors:
            # Блокируем коммит
            log_debug("Critical errors found, blocking commit")

            # Возвращаем JSON с permissionDecision: deny
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": feedback,
                }
            }
            print(json.dumps(output))
            sys.exit(0)
        else:
            # Предупреждаем, но разрешаем
            log_debug("Checks passed with warnings or no issues")

            if debug_warnings or file_warnings:
                # Есть предупреждения - показываем и разрешаем
                output = {
                    "hookSpecificOutput": {
                        "hookEventName": "PreToolUse",
                        "permissionDecision": "allow",
                        "permissionDecisionReason": feedback,
                    },
                    "suppressOutput": False,  # Показываем в transcript
                }
                print(json.dumps(output))
            else:
                # Всё отлично - тихо разрешаем
                log_debug("All checks passed, allowing commit silently")
                # Просто не выводим ничего, разрешая продолжить
                pass

            sys.exit(0)

    except json.JSONDecodeError as e:
        log_debug(f"JSON decode error: {e}")
        sys.exit(1)
    except Exception as e:
        log_debug(f"Unexpected error: {e}")
        # В случае ошибки разрешаем продолжить
        sys.exit(0)


if __name__ == "__main__":
    main()

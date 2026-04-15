# Gemini CLI Command Reference

> **Canonical source**: https://geminicli.com/docs/cli/cli-reference
> **Last verified**: 2026-03-16 (Gemini CLI v0.33.1)

## Installation

```bash
npm install -g @google/gemini-cli    # npm (global)
brew install gemini-cli               # Homebrew (macOS/Linux)
npx @google/gemini-cli                # one-off without installing
gemini update                         # update existing installation
```

## Authentication

```bash
# Option 1: Environment variable
export GEMINI_API_KEY=your_key

# Option 2: .env file (recommended for persistence)
# Create ~/.gemini/.env or ./.gemini/.env with:
GEMINI_API_KEY="your_key"

# Option 3: OAuth (interactive, 60 req/min free tier)
gemini  # First run prompts for auth
```

## Core Command: One-Shot

All commands from Claude Code use `-p` flag to force non-interactive mode. Do NOT pass `-m` — rely on **Auto (Gemini 3)** routing.

```bash
gemini -p "prompt"
```

**Prerequisite**: `previewFeatures: true` must be set in `~/.gemini/settings.json` for Auto routing to use Gemini 3 models.

**Key Options:**

| Flag | Description |
|---|---|
| `-p "PROMPT"` | Non-interactive one-shot prompt (REQUIRED from Claude Code) |
| `-o, --output-format FMT` | `text` (default), `json`, `stream-json` |
| `--approval-mode MODE` | `default`, `auto_edit`, `yolo` |
| `-s, --sandbox` | Run in Docker/Podman sandbox |
| `--include-directories DIR` | Extra workspace dirs (comma-separated) |
| `-d, --debug` | Verbose debug logging |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## Model Routing & Thinking

### Auto Routing — Default Mode

Do NOT pass `-m` flag. Auto routing uses a classifier + main model pattern:

1. **Classifier**: `gemini-2.5-flash-lite` (lightweight, fast — determines task complexity)
2. **Simple tasks** → `gemini-3-flash-preview` or `gemini-2.5-flash` (routing can vary — [known issue #22381](https://github.com/google-gemini/gemini-cli/issues/22381))
3. **Complex tasks** → `gemini-3.1-pro-preview` (if available) or `gemini-2.5-pro`

**Fallback chain** (on limits/capacity): Gemini 3.1 Pro → Gemini 2.5 Pro → Gemini 2.5 Flash.

> **Important**: The classifier using `gemini-2.5-flash-lite` is expected behavior — it's a routing decision, not the answer model.

### Model Aliases (from official CLI reference)

| Alias | Resolves To | Description |
|---|---|---|
| `auto` (default) | `gemini-3-pro-preview` (preview) or `gemini-2.5-pro` | Default. Uses preview model if `previewFeatures: true` |
| `pro` | Same as `auto` | Alias for complex reasoning tasks |
| `flash` | `gemini-2.5-flash` | Fast, balanced model |
| `flash-lite` | `gemini-2.5-flash-lite` | Fastest, cheapest |

### Available 3.x Models

| Model | Status | Use Case |
|---|---|---|
| `gemini-3.1-pro-preview` | **Preview (NEW)** | Frontier reasoning, complex tasks |
| `gemini-3-flash-preview` | **Preview** | Frontier-class at fraction of cost |
| `gemini-3.1-flash-lite` | **Preview (NEW)** | Budget 3.x option |
| `gemini-3-pro-preview` | **SHUT DOWN** (March 9, 2026) | Do not use |

### 2.x Models (used by router & fallback — NOT banned)

| Model | Role |
|---|---|
| `gemini-2.5-flash-lite` | Internal classifier/router (auto routing) |
| `gemini-2.5-flash` | Fallback for simple tasks, rate-limit fallback |
| `gemini-2.5-pro` | Fallback when 3.x Pro is unavailable/at capacity |

> Do not manually pass 2.x models via `-m` (prefer Auto routing), but they are NOT banned from the system — they're part of the fallback chain.

## Output Formats

### Text (default)
```bash
gemini -p "prompt"
```

### JSON (recommended for automation)
```bash
gemini -p "prompt" -o json > /tmp/gemini.json
jq -r '.response' /tmp/gemini.json
```

JSON schema:
```json
{
  "session_id": "...",
  "response": "final answer text",
  "stats": { "models": { "tokens": {} }, "tools": { "byName": {} } },
  "error": {}
}
```

The `.response` field contains ONLY the final answer -- no tool traces, no reasoning chain.

### Stream JSON
```bash
gemini -p "prompt" -o stream-json > /tmp/events.jsonl
```

Event types: `init`, `message`, `tool_use`, `tool_result`, `error`, `result`.

## File Injection

Use `@path` to inject file or directory contents into the prompt context.

```bash
gemini -p "Review this code @src/main.ts"
gemini -p "Analyze @src/ for security issues"
```

- `@file.ts` -- inject single file
- `@src/` -- inject entire directory (recursive)
- Multiple `@` references allowed in one prompt
- Use `.geminiignore` (like `.gitignore` syntax) to exclude paths from injection

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error or API failure |
| `42` | Input error (invalid prompt/arguments) |
| `53` | Turn limit exceeded |

## Configuration

| File | Scope |
|---|---|
| `/etc/gemini-cli/settings.json` | System (highest precedence) |
| `~/.gemini/settings.json` | User |
| `.gemini/settings.json` | Project (base) |
| `~/.gemini/GEMINI.md` | Global context (all projects) |
| `.gemini/GEMINI.md` | Project context (auto-loaded) |
| `.geminiignore` | File exclusions (like .gitignore) |
| `~/.gemini/.env` | Auth (global) |
| `.gemini/.env` | Auth (project) |

**GEMINI.md** is Gemini's equivalent of CLAUDE.md -- project instructions auto-loaded into every session.

## Built-in Tools

Gemini CLI includes these tools by default. Nudge phrases activate them in prompts.

| Tool | Nudge Phrase | What It Does |
|---|---|---|
| `google_web_search` | "search the web for...", "look up..." | Google Search grounding (Gemini's unique advantage) |
| `web_fetch` | "fetch this URL...", "read this page..." | Retrieve and parse web page content |
| `run_shell_command` | "run...", "execute..." | Execute shell commands (requires yolo or approval) |
| `read_file` | "read...", "show me..." | Read file contents into context |
| `write_file` | "write to...", "create file..." | Write/create files (requires approval) |
| `save_memory` | "remember that...", "save this fact..." | Persist facts to `~/.gemini/memory.json` |

Note: In one-shot mode with `--approval-mode=yolo`, tool calls are auto-approved. Without it, tool calls requiring write access will be blocked.

## Timeout Expectations

| Task Type | Expected Duration |
|---|---|
| Simple query | 15-45 seconds |
| Code review (small) | 1-3 minutes |
| Code review (large) | 3-7 minutes |
| Web research | 30-90 seconds |
| Complex analysis | 3-10 minutes |

If `gemini-3.1-pro-preview` returns 429 (capacity), CLI auto-retries with exponential backoff. Fallback chain: 3.1 Pro → 2.5 Pro → 2.5 Flash.

## Error Handling & Troubleshooting

| Issue | Solution |
|---|---|
| "API key not found" | Set `GEMINI_API_KEY` or create `~/.gemini/.env` |
| "Rate limit exceeded" / 429 | Wait for auto-retry; falls back: 3.1 Pro → 2.5 Pro → 2.5 Flash |
| "No capacity available" | `gemini-3.1-pro-preview` at capacity; retry or use `-m gemini-3-flash-preview` |
| "Context too large" | Use `.geminiignore` or target specific files with `@` |
| "Tool call failed" | Use `-o json` and inspect `.error` field |
| "Folder not trusted" | Run from project root or add to trusted folders |
| Command not found | `command -v gemini` to check; reinstall with npm/brew |
| **CLI hangs indefinitely** | Nonexistent `@path` reference can cause hang — verify paths exist first ([#6440](https://github.com/google-gemini/gemini-cli/issues/6440)) |
| **Timeout** | Set Bash tool `timeout` param (60s–300s depending on task); or use shell `timeout 120 gemini ...` |

### @path Safety

`@path` references inject file/directory contents into the prompt. **If the referenced path doesn't exist**, the CLI may hang indefinitely or crash without a useful error. Always verify paths before running.

```bash
# Safe pattern: verify file exists before invoking
[ -f "path/to/file.ts" ] && gemini -p "Review @path/to/file.ts" --approval-mode=yolo -o json ...
```

Debug mode:
```bash
gemini -p "prompt" --debug -o text
```

Error reports saved to: `/var/folders/.../gemini-client-error-*.json`

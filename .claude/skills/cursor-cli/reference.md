# Cursor CLI Reference

Command reference for Cursor CLI (Agent mode). Last verified against v2026.03.20.

> **Self-update**: If any flag or command below seems wrong, check the official reference:
> https://cursor.com/docs/cli/headless

## Installation

```bash
# macOS / Linux / WSL
curl https://cursor.com/install -fsS | bash

# Windows (PowerShell)
irm 'https://cursor.com/install?win32=true' | iex

# Verify
agent --version
```

The CLI binary is `agent` (also invocable as `cursor agent` or `cursor-agent`).

## Authentication

```bash
# Option 1: Environment variable (recommended for headless/CI)
export CURSOR_API_KEY=your_api_key_here

# Option 2: CLI flag
agent -p "prompt" --api-key your_key

# Option 3: Interactive login (if Cursor app is configured)
agent status
```

## Core Command: One-Shot

All commands from Claude Code use `-p` flag to force non-interactive mode.

```bash
agent -p "prompt" --model composer-2 --mode=ask --trust
```

**Key Options:**

| Flag | Description |
|---|---|
| `-p, --print` | Non-interactive headless mode (REQUIRED from Claude Code) |
| `--model MODEL` | Model to use (default: `composer-2` for cross-AI validation) |
| `--mode MODE` | `ask` (read-only), `plan` (planning), default (full agent) |
| `--trust` | Trust workspace without prompting (REQUIRED for headless) |
| `--output-format FMT` | `text` (default), `json`, `stream-json` |
| `-f, --force` / `--yolo` | Auto-approve file edits (DO NOT use for reviews) |
| `-c, --cloud` | Run in cloud mode (offload to Cursor cloud) |
| `--api-key KEY` | API key for authentication |
| `-H, --header HEADER` | Custom headers (format: `Name: Value`) |
| `--sandbox MODE` | `enabled` or `disabled` |
| `--approve-mcps` | Auto-approve all MCP servers |
| `--workspace PATH` | Set working directory |
| `-w, --worktree [NAME]` | Run in isolated git worktree |
| `--worktree-base BRANCH` | Base branch for worktree |
| `--resume [CHAT_ID]` | Resume a previous session |
| `--continue` | Continue previous session |
| `--list-models` | List available models and exit |
| `-v, --version` | Show version |

## Model Selection

### Default Model: `composer-2`

Always use `--model composer-2` for cross-AI validation. Composer 2 is Cursor's frontier in-house model — fine-tuned Kimi K2.5 with reinforcement learning on long-horizon coding tasks.

### Available Models (verified March 2026)

| Model ID | Description |
|---|---|
| `composer-2` | **Default for cross-AI.** Frontier coding, RL-trained |
| `composer-2-fast` | Faster variant, same intelligence |
| `composer-1.5` | Previous generation |
| `claude-4.6-opus-high-thinking` | Opus 4.6 1M Thinking |
| `claude-4.6-sonnet-medium` | Sonnet 4.6 1M |
| `gpt-5.4-medium` | GPT-5.4 1M |
| `gpt-5.3-codex` | GPT-5.3 Codex |
| `gemini-3.1-pro` | Gemini 3.1 Pro |
| `grok-4-20` | Grok 4.20 |

Run `agent --list-models` for the full current list.

## Agent Modes

| Mode | Flag | Description |
|---|---|---|
| Agent | (default) | Full tool access — reads, writes, runs commands |
| Ask | `--mode=ask` | Read-only exploration, no file changes (**use for reviews**) |
| Plan | `--mode=plan` or `--plan` | Design approach, clarifying questions, no edits |

For cross-AI validation, always use `--mode=ask` to guarantee read-only operation.

## Output Formats

### Text (default — recommended for cross-AI)

```bash
agent -p "prompt" --output-format text > /tmp/cursor-result.txt
```

Clean final answer, suitable for piping.

### JSON

```bash
agent -p "prompt" --output-format json > /tmp/cursor.json
jq -r '.result' /tmp/cursor.json
```

JSON schema:
```json
{
  "session_id": "...",
  "result": "final answer text",
  "stats": { "models": {}, "tools": {} }
}
```

### Stream JSON (real-time events)

```bash
agent -p "prompt" --output-format stream-json > /tmp/events.jsonl
```

Event types: `system/init`, `user`, `assistant`, `tool_call`, `result`.

## Commands

| Command | Description |
|---|---|
| `agent` | Start interactive session |
| `agent "prompt"` | Start with initial prompt |
| `agent -p "prompt"` | Headless one-shot (non-interactive) |
| `agent --list-models` | List available models |
| `agent --resume [ID]` | Resume a previous session |
| `agent --continue` | Continue last session |
| `agent install-shell-integration` | Install zsh shell integration |

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error or API failure |
| `42` | Input error (invalid prompt/arguments) |
| `53` | Turn limit exceeded |

## Timeout Expectations

| Task Type | Expected Duration |
|---|---|
| Simple query | 15-45 seconds |
| Code review (small) | 1-3 minutes |
| Code review (large) | 3-7 minutes |
| Complex analysis | 5-10 minutes |

## Error Handling

| Issue | Solution |
|---|---|
| "Workspace Trust Required" | Add `--trust` flag (required for headless mode) |
| "API key not found" | Set `CURSOR_API_KEY` env var or use `--api-key` |
| Rate limit / 429 | Wait and retry; consider `--model composer-2-fast` |
| Command not found | `command -v agent` to check; reinstall with `curl https://cursor.com/install -fsS \| bash` |
| Timeout | Set Bash tool `timeout` param (60s-300s depending on task) |
| MCP approval prompt | Add `--approve-mcps` to auto-approve |
| Hangs on startup | Ensure `--trust` and `-p` are both present |

## Configuration

| File | Scope |
|---|---|
| `~/.cursor/settings.json` | User settings |
| `.cursor/settings.json` | Project settings |
| `.cursor/rules/` | Project-specific rules (like .cursorrules) |

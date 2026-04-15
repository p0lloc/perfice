# Codex CLI Reference

Command reference for Codex CLI. Last verified against v0.116.0.

> **Self-update**: If any flag or command below seems wrong, check the official reference:
> https://developers.openai.com/codex/cli/reference/

## Commands Overview

| Command | Maturity | Description |
|---|---|---|
| `codex` | Stable | Launch interactive TUI |
| `codex exec` (alias: `codex e`) | Stable | Run non-interactively (one-shot) |
| `codex review` | Stable | Top-level review (limited flags) |
| `codex exec review` | Stable | Non-interactive review (full flags) |
| `codex apply` (alias: `codex a`) | Stable | Apply latest Codex Cloud diff |
| `codex resume` | Stable | Resume previous session |
| `codex fork` | Stable | Fork previous session into new thread |
| `codex cloud` | Experimental | Browse/execute Codex Cloud tasks |
| `codex features` | Stable | Manage feature flags |
| `codex login` / `codex logout` | Stable | Manage authentication |
| `codex mcp` | Experimental | Manage MCP servers |
| `codex mcp-server` | Experimental | Run Codex as MCP server (stdio) |
| `codex sandbox` | Experimental | Run commands in Codex sandbox |
| `codex completion` | Stable | Generate shell completions |
| `codex app` | Stable | Launch macOS desktop app |
| `codex execpolicy` | Experimental | Evaluate exec policy rules |

## Critical: Review Command Variants

### `codex review` (top-level) — LIMITED FLAGS

```bash
codex review [OPTIONS] [PROMPT]
```

**Only these flags are supported:**
| Flag | Description |
|---|---|
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base BRANCH` | Review changes against base branch |
| `--commit SHA` | Review specific commit |
| `--title TITLE` | Optional title for review summary |
| `-c, --config key=value` | Override config value |
| `--enable FEATURE` | Enable a feature flag |
| `--disable FEATURE` | Disable a feature flag |

**Does NOT support**: `-m`, `--full-auto`, `-o`, `-s`, `--sandbox`, `--search`, `-i`

### `codex exec review` — FULL FLAGS (use this one)

```bash
codex exec review [OPTIONS] [PROMPT]
```

Inherits all `codex exec` flags. **This is what the skill uses.**

**Supported flags:**
| Flag | Description |
|---|---|
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base BRANCH` | Review changes against base branch |
| `--commit SHA` | Review specific commit |
| `--title TITLE` | Optional title for review summary |
| `-m, --model MODEL` | Model to use (e.g., `gpt-5.4`) |
| `--full-auto` | Low-friction automation (workspace-write + on-request) |
| `-o, --output-last-message FILE` | Write final response to file |
| `--json` | Output events as JSONL |
| `--ephemeral` | Don't persist session files |
| `--skip-git-repo-check` | Allow running outside a git repo |
| `--dangerously-bypass-approvals-and-sandbox` | Skip all approvals (DANGEROUS) |
| `-c, --config key=value` | Override config value |
| `--enable FEATURE` | Enable a feature flag |
| `--disable FEATURE` | Disable a feature flag |

**Examples:**
```bash
# Review uncommitted changes (with output file)
codex exec review --uncommitted -m gpt-5.4 --full-auto -o /tmp/review.md > /dev/null 2>&1

# Review against main branch
codex exec review --base main -m gpt-5.4 --full-auto -o /tmp/review.md > /dev/null 2>&1

# Review specific commit
codex exec review --commit abc123 -m gpt-5.4 --full-auto -o /tmp/review.md > /dev/null 2>&1

# Custom review focus
codex exec review --uncommitted "Focus on security issues" -m gpt-5.4 --full-auto -o /tmp/review.md > /dev/null 2>&1
```

## `codex exec` (alias: `codex e`)

Run Codex non-interactively (one-shot).

```bash
codex exec [OPTIONS] [PROMPT]
```

**Arguments:**
- `PROMPT` - Instructions for the agent. Use `-` to read from stdin.

**Key Options:**
| Flag | Description |
|---|---|
| `-m, --model MODEL` | Model to use (e.g., `gpt-5.4`) |
| `--full-auto` | Low-friction automation (workspace-write sandbox + on-request approval) |
| `-o, --output-last-message FILE` | Write final response to file |
| `-C, --cd DIR` | Set working directory |
| `-s, --sandbox MODE` | `read-only`, `workspace-write`, `danger-full-access` |
| `-a, --ask-for-approval MODE` | `untrusted`, `on-request`, `never` (`on-failure` deprecated) |
| `--json` | Output events as JSONL |
| `-i, --image FILE` | Attach image(s) to prompt |
| `-p, --profile NAME` | Load config profile from `~/.codex/config.toml` |
| `-c, --config key=value` | Override config value (TOML parsed) |
| `--add-dir DIR` | Additional writable directories |
| `--ephemeral` | Don't persist session files to disk |
| `--output-schema FILE` | JSON Schema for structured final response |
| `--skip-git-repo-check` | Allow running outside a git repo |
| `--search` | Enable live web search |
| `--oss` | Use local open source model provider (Ollama/LM Studio) |
| `--local-provider PROVIDER` | Specify local provider (`lmstudio` or `ollama`) |
| `--enable FEATURE` | Enable a feature flag |
| `--disable FEATURE` | Disable a feature flag |
| `--progress-cursor` | Force cursor-based progress updates |
| `--color MODE` | `always`, `never`, `auto` (default: auto) |
| `--dangerously-bypass-approvals-and-sandbox` | Skip all approvals + sandbox (DANGEROUS) |

### `codex exec resume`

Resume a previous non-interactive session:

```bash
# Resume most recent
codex exec resume --last "[follow-up prompt]"

# Resume specific session
codex exec resume SESSION_ID "[follow-up prompt]"
```

## Global Flags (apply to all commands)

| Flag | Description |
|---|---|
| `-m, --model MODEL` | Override model |
| `--full-auto` | Shortcut for `-a on-request -s workspace-write` |
| `-s, --sandbox MODE` | Sandbox policy |
| `-a, --ask-for-approval MODE` | Approval policy |
| `-i, --image FILE` | Attach images |
| `-C, --cd DIR` | Working directory |
| `-c, --config key=value` | Config override |
| `-p, --profile NAME` | Config profile |
| `--search` | Enable live web search |
| `--oss` | Use local OSS provider |
| `--enable / --disable` | Feature flags |
| `--dangerously-bypass-approvals-and-sandbox` / `--yolo` | No sandbox, no approvals |

> **Note**: Global flags propagate to subcommands, but the top-level `codex review`
> only accepts its own limited set (see above). Use `codex exec review` for full flag support.

## Configuration

### Model Selection

```bash
# Explicit model flag
codex exec "prompt" -m gpt-5.4

# Override reasoning effort
codex exec "prompt" -m gpt-5.4 -c model_reasoning_effort=high

# Use faster model
codex exec "prompt" -m gpt-5.3-codex
```

### Sandbox Modes

| Mode | Description |
|---|---|
| `read-only` | Can read files but not modify |
| `workspace-write` | Can write to working directory (default with `--full-auto`) |
| `danger-full-access` | Full system access (dangerous) |

### Approval Policies

| Policy | Behavior |
|---|---|
| `untrusted` | Only trusted commands auto-approved, everything else prompts (default) |
| `on-request` | Model decides when to ask (default with `--full-auto`) |
| `never` | No prompts; fully autonomous |
| `on-failure` | **DEPRECATED** — only asks on failure. Prefer `on-request` or `never` |

### Convenience Shortcuts

| Shortcut | Equivalent |
|---|---|
| `--full-auto` | `-a on-request -s workspace-write` |
| `--yolo` | `--dangerously-bypass-approvals-and-sandbox` (no sandbox, no approvals) |

### Configuration File

Location: `~/.codex/config.toml`

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
web_search = "cached"        # "cached" | "live" | "disabled"
personality = "pragmatic"    # "friendly" | "pragmatic" | "none"

[features]
unified_exec = true
shell_snapshot = true
multi_agent = true
web_search = true
```

Profiles can be defined and selected with `-p`:
```toml
[profile.review]
sandbox_mode = "read-only"
approval_policy = "never"

[profile.auto]
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

### Feature Flags

```bash
codex features list                    # Show all flags
codex features enable unified_exec     # Persist enable
codex features disable shell_snapshot  # Persist disable
```

## Timeout Expectations

| Task Type | Expected Duration |
|---|---|
| Simple query | 30-60 seconds |
| Code review (small) | 1-3 minutes |
| Code review (large) | 3-7 minutes |
| Complex analysis | 5-10 minutes |

## Error Handling

### MCP Server Errors
MCP startup errors don't affect core functionality. These are optional integrations.

### Rate Limits
Codex handles rate limits automatically with backoff. Space out requests if hitting limits frequently.

### Command Not Found
```bash
command -v codex       # Check installation
codex --version        # Check version
npm i -g @openai/codex # Install/update
brew install --cask codex  # Or via Homebrew
```

### Sandbox Approval Loop (v0.115-0.116 bug)
If Codex prompts for approval on nearly every command, downgrade to v0.114.0 or upgrade past v0.116.0. This was a known regression fixed in later releases.

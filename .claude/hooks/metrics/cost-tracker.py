#!/usr/bin/env python3
"""
Cost Tracker — Estimate and log session token costs.

Event:     Stop
Matcher:   (none)
Blocking:  No (always exit 0)
Wired:     Yes (default in settings.json)

Reads input_tokens_used and output_tokens_used from the Stop event,
estimates cost using blended model rates, and appends a JSONL row
to ~/.claude/metrics/costs.jsonl.

Configuration:
  RATES       — per-model token pricing (edit to match your contract)
  METRICS_DIR — where to write cost logs (default: ~/.claude/metrics)

To enable, add to .claude/settings.json hooks.Stop:
  {
    "hooks": [{"type": "command", "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/metrics/cost-tracker.py"}]
  }
"""

import json
import os
import sys
from datetime import datetime, timezone

# Blended rates per 1M tokens (USD)
RATES = {
    "sonnet": {"input": 3.0, "output": 15.0},
    "opus": {"input": 15.0, "output": 75.0},
    "haiku": {"input": 0.25, "output": 1.25},
}

# Default to blended Sonnet/Opus average for unknown models
DEFAULT_RATE = {"input": 9.0, "output": 45.0}

METRICS_DIR = os.path.expanduser("~/.claude/metrics")
COSTS_FILE = os.path.join(METRICS_DIR, "costs.jsonl")


def detect_model(input_data: dict) -> str:
    """Detect model from session data, falling back to 'unknown'."""
    model = input_data.get("model", "")
    model_lower = model.lower() if model else ""
    if "opus" in model_lower:
        return "opus"
    if "haiku" in model_lower:
        return "haiku"
    if "sonnet" in model_lower:
        return "sonnet"
    return "unknown"


def estimate_cost(input_tokens: int, output_tokens: int, model: str) -> float:
    """Estimate cost in USD."""
    rates = RATES.get(model, DEFAULT_RATE)
    input_cost = (input_tokens / 1_000_000) * rates["input"]
    output_cost = (output_tokens / 1_000_000) * rates["output"]
    return round(input_cost + output_cost, 6)


def main():
    try:
        input_data = json.load(sys.stdin)

        input_tokens = input_data.get("input_tokens_used", 0) or 0
        output_tokens = input_data.get("output_tokens_used", 0) or 0

        # Skip if no token data
        if input_tokens == 0 and output_tokens == 0:
            sys.exit(0)

        model = detect_model(input_data)
        cost = estimate_cost(input_tokens, output_tokens, model)

        row = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "estimated_cost_usd": cost,
            "session_id": input_data.get("session_id", "unknown"),
        }

        # Ensure metrics directory exists
        os.makedirs(METRICS_DIR, exist_ok=True)

        # Append JSONL row
        with open(COSTS_FILE, "a") as f:
            f.write(json.dumps(row) + "\n")

    except Exception:
        # Non-blocking — swallow all errors
        pass
    finally:
        sys.exit(0)


if __name__ == "__main__":
    main()

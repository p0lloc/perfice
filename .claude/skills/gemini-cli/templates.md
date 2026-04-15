# Gemini CLI Prompt Templates

> **Model**: Auto routing (do NOT pass `-m`). Classifier → `gemini-3-flash-preview` or `gemini-3.1-pro-preview` based on complexity. Fallback: 2.5 Pro → 2.5 Flash.

**Output pipeline** (appended to every template — shown once, abbreviated as `# ...pipeline` below):
```bash
--approval-mode=yolo -o json > /tmp/gemini.json 2> /dev/null \
&& jq -r '.response' /tmp/gemini.json > /tmp/gemini-result.txt \
&& echo "Gemini completed"
```
Read result with **Read tool** on `/tmp/gemini-result.txt` — never `cat`.

---

## Approach Validation

### Architecture Decision
```bash
gemini -p "Output ONLY the final answer.
I need to decide between approaches for [feature]:
Option A: [Description] — Pros: [...] Cons: [...]
Option B: [Description] — Pros: [...] Cons: [...]
Context: [project context, file paths]. Requirements: [key requirements].
Which approach would you recommend and why?" # ...pipeline
```

### Pre-Implementation Review
```bash
gemini -p "Output ONLY the final answer.
Review this implementation approach for @[task-file-path]:
1. [Step 1]  2. [Step 2]  3. [Step 3]
Is this aligned with requirements? What issues might I encounter?" # ...pipeline
```

---

## Code Review

### Custom Review Focus
```bash
gemini -p "Output ONLY the final answer.
Review uncommitted changes in this repository. Focus on:
1. [Focus area 1]  2. [Focus area 2]  3. [Focus area 3]
Provide specific feedback for each area." # ...pipeline
```

### File-Specific Review with Context
```bash
gemini -p "Output ONLY the final answer.
Review implementation in @[file1.ts] and @[file2.ts].
Check against requirements in @[tech-decomposition.md].
Focus on: correctness, edge cases, error handling." # ...pipeline
```

---

## Security Review

### General Security Audit
```bash
gemini -p "Output ONLY the final answer.
Security review of uncommitted changes. Check for: SQL/NoSQL injection, XSS,
command injection, auth issues, sensitive data exposure, input validation gaps.
Report findings with severity (Critical/High/Medium/Low)." # ...pipeline
```

### API Security Review
```bash
gemini -p "Output ONLY the final answer.
Review @[file/endpoint] for API security: rate limiting, input validation,
authentication, authorization, error info leakage, CORS configuration." # ...pipeline
```

---

## Implementation Verification

### Feature Completion Check
```bash
gemini -p "Output ONLY the final answer.
Verify [feature] implementation is complete per @[task-file-path].
Requirements: 1. [...] 2. [...] 3. [...]
Key files: @[file1] @[file2]
Check: all requirements met? Edge cases? Error handling? Test coverage?" # ...pipeline
```

### Refactoring Verification
```bash
gemini -p "Output ONLY the final answer.
Verify this refactoring preserves behavior.
Original behavior: [description]. Changed files: @[file1] @[file2].
Check: functionality preserved? Subtle behavior changes? New edge case bugs?" # ...pipeline
```

---

## Test Assessment

### Test Coverage Review
```bash
gemini -p "Output ONLY the final answer.
Review test coverage for @[file/module]. Key functionality: [Function 1], [Function 2].
All public functions tested? Edge cases? Error paths? What is missing?" # ...pipeline
```

---

## Performance & Bug Investigation

### Performance Analysis
```bash
gemini -p "Output ONLY the final answer.
Analyze @[file/function] for performance: inefficient algorithms, memory leaks,
blocking operations, missing caching, N+1 query patterns." # ...pipeline
```

### Bug Root Cause Analysis
```bash
gemini -p "Output ONLY the final answer.
Investigate bug — Symptom: [what happens]. Expected: [what should happen].
Context: [relevant info]. Suspected files: @[file1] @[file2].
Find root cause and suggest a fix." # ...pipeline
```

---

## Web Research (Gemini-Specific)

Gemini has built-in Google Search grounding — its unique advantage over other CLI tools.

### Current Information with Google Search
```bash
gemini -p "Output ONLY the final answer.
Use Google Search to find current information about [topic] as of [date].
Summarize key points with sources." # ...pipeline
```

### Library/API Research
```bash
gemini -p "Output ONLY the final answer.
Research [library/API] via Google Search: latest version, recent changes,
best practices, common patterns, known gotchas, migration notes from [version]." \
  # ...pipeline
```

### Comparison Research
```bash
gemini -p "Output ONLY the final answer.
Compare [option A] vs [option B] for [use case]. Use Google Search for current
benchmarks and community opinions. Provide recommendation with rationale." # ...pipeline
```

---

## Integration Patterns

### Generate-Review-Fix Cycle

Claude generates code, Gemini reviews, Claude fixes — three-step quality loop.

```bash
# 1. Claude generates code (in this conversation)
# 2. Gemini reviews Claude's work
gemini -p "Output ONLY the final answer.
Review @[generated-file] for bugs, security issues, and improvements.
List each finding with severity." # ...pipeline
# 3. Claude reads review via Read tool and applies fixes
```

### Cross-Validation with Claude

Second opinion on architecture, security, or complex logic.

```bash
gemini -p "Output ONLY the final answer.
Evaluate this approach: [Claude's proposed approach].
Risks, blind spots, or better alternatives?" # ...pipeline
```

### JSON Output for Programmatic Processing

Extract structured data from Gemini for further processing.

```bash
gemini -p "Output ONLY valid JSON. No markdown fences. No explanation.
[PROMPT requiring structured output]" --approval-mode=yolo -o json \
  > /tmp/gemini.json 2> /dev/null \
  && jq -r '.response' /tmp/gemini.json | jq '.' > /tmp/gemini-structured.json \
  && echo "Gemini completed"
```

### Multi-line Prompt with HEREDOC

For prompts too long for inline quoting.

```bash
PROMPT=$(cat <<'GEMINI_PROMPT'
Output ONLY the final answer.
[Long multi-line prompt here.
Include @file/paths for context.]
GEMINI_PROMPT
)
gemini -p "$PROMPT" --approval-mode=yolo -o json \
  > /tmp/gemini.json 2> /dev/null \
  && jq -r '.response' /tmp/gemini.json > /tmp/gemini-result.txt \
  && echo "Gemini completed"
```

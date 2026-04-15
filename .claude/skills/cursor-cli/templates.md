# Cursor CLI Prompt Templates

Reusable prompt templates for common Cursor operations.

> **Model**: Always use `--model composer-2`. Composer 2 is Cursor's frontier
> in-house model — provides a non-OpenAI/non-Anthropic perspective for cross-AI validation.

**Output pipeline** (appended to every template — shown once, abbreviated as `# ...pipeline` below):
```bash
--model composer-2 --mode=ask --trust \
--output-format text > /tmp/cursor-result.txt 2> /dev/null \
&& echo "Cursor completed"
```
Read result with **Read tool** on `/tmp/cursor-result.txt` — never `cat`.

---

## Approach Validation

### Architecture Decision
```bash
agent -p "I need to decide between these approaches for [feature]:

Option A: [Description]
- Pros: [...]
- Cons: [...]

Option B: [Description]
- Pros: [...]
- Cons: [...]

Context: [Project context, relevant file paths]
Requirements: [Key requirements]

Which approach would you recommend and why?" # ...pipeline
```

### Pre-Implementation Review
```bash
agent -p "Review this implementation approach for the feature described in [task-file-path]:

## Proposed Approach
1. [Step 1]
2. [Step 2]
3. [Step 3]

Is this aligned with the requirements? What issues might I encounter?" # ...pipeline
```

---

## Code Review

### Custom Review Focus
```bash
agent -p "Review the uncommitted changes in this repository. Focus on:
1. [Focus area 1]
2. [Focus area 2]
3. [Focus area 3]

Provide specific feedback for each area." # ...pipeline
```

### File-Specific Review with Context
```bash
agent -p "Review implementation in these files:
- [path/to/file1.ts]
- [path/to/file2.ts]

Check against requirements in: [path/to/task/tech-decomposition.md]
Focus on: correctness, edge cases, error handling" # ...pipeline
```

---

## Security Review

### General Security Audit
```bash
agent -p "Perform a security review of the uncommitted changes. Check for:
- SQL/NoSQL injection
- XSS vulnerabilities
- Command injection
- Authentication/authorization issues
- Sensitive data exposure
- Input validation gaps

Report findings with severity levels (Critical/High/Medium/Low)." # ...pipeline
```

### API Security Review
```bash
agent -p "Review [file/endpoint] for API security:
- Rate limiting
- Input validation
- Authentication checks
- Authorization (access control)
- Error handling (info leakage)
- CORS configuration" # ...pipeline
```

---

## Implementation Verification

### Feature Completion Check
```bash
agent -p "Verify implementation of [feature] is complete.

Requirements (from [task-file-path]):
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Key files:
- [file1]
- [file2]

Check: All requirements implemented? Edge cases handled? Error handling adequate? Tests cover key paths?" # ...pipeline
```

### Refactoring Verification
```bash
agent -p "Verify this refactoring preserves behavior:

Original behavior: [description]
Changed files: [files]

Check that:
1. All existing functionality preserved
2. No subtle behavior changes
3. No new edge case bugs introduced" # ...pipeline
```

---

## Test Assessment

### Test Coverage Review
```bash
agent -p "Review test coverage for [file/module].

Key functionality:
- [Function 1]
- [Function 2]

Check: Are all public functions tested? Edge cases covered? Error paths tested? What's missing?" # ...pipeline
```

---

## Performance & Bug Investigation

### Performance Analysis
```bash
agent -p "Analyze [file/function] for performance issues:
- Inefficient algorithms (O(n^2) etc.)
- Memory leaks or excessive allocation
- Blocking operations
- Missing caching opportunities
- N+1 query patterns" # ...pipeline
```

### Bug Root Cause Analysis
```bash
agent -p "Help investigate this bug:

Symptom: [What's happening]
Expected: [What should happen]
Context: [Relevant context]
Suspected files: [files]

Find the root cause and suggest a fix." # ...pipeline
```

---

## Cursor-Specific Templates

### Multi-Model Comparison

Run the same prompt with different models to get diverse perspectives:

```bash
# Composer 2 (default — Kimi K2.5 fine-tune)
agent -p "[review prompt]" --model composer-2 # ...pipeline

# GPT-5.4 (for OpenAI perspective)
agent -p "[review prompt]" --model gpt-5.4-medium # ...pipeline

# Gemini 3.1 Pro (for Google perspective)
agent -p "[review prompt]" --model gemini-3.1-pro # ...pipeline
```

This gives three model perspectives through a single CLI — useful when codex-cli or gemini-cli are unavailable.

### Cloud Agent (Heavy Tasks)

Offload complex analysis to Cursor's cloud infrastructure:

```bash
agent -p "[complex analysis prompt]" \
  --model composer-2 -c --trust \
  --output-format text > /tmp/cursor-cloud.txt 2> /dev/null \
  && echo "Cloud analysis completed"
```

Note: Cloud mode (`-c`) runs the task on Cursor's servers. Use for tasks that might exceed local timeout limits.

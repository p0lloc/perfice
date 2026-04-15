# Codex CLI Prompt Templates

Reusable prompt templates for common Codex operations.

> **Model note**: Templates below use `MODEL` as placeholder. Replace with the current
> recommended model (currently `gpt-5.4`). Check `codex --help` or the
> [changelog](https://developers.openai.com/codex/changelog/) if unsure.
>
> **Important**: All review templates use `codex exec review` (NOT `codex review`).
> The top-level `codex review` does not support `-m`, `--full-auto`, or `-o` flags.

**Output pattern** (always use):
- Custom prompts: `-o /tmp/codex-result.md > /dev/null 2>&1 && echo "Codex completed"`
- Reviews: `-o /tmp/codex-review.md > /dev/null 2>&1 && echo "Review completed"`
- Always read result with **Read tool**, never `cat`

---

## Approach Validation

### Architecture Decision
```bash
codex exec "I need to decide between these approaches for [feature]:

Option A: [Description]
- Pros: [...]
- Cons: [...]

Option B: [Description]
- Pros: [...]
- Cons: [...]

Context: [Project context, relevant file paths]
Requirements: [Key requirements]

Which approach would you recommend and why?" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

### Pre-Implementation Review
```bash
codex exec "Review this implementation approach for the feature described in [task-file-path]:

## Proposed Approach
1. [Step 1]
2. [Step 2]
3. [Step 3]

Is this aligned with the requirements? What issues might I encounter?" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

---

## Code Review

### Custom Review Focus
```bash
codex exec review --uncommitted "Focus on:
1. [Focus area 1]
2. [Focus area 2]
3. [Focus area 3]

Provide specific feedback for each area." \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-review.md > /dev/null 2>&1
```

### File-Specific Review with Context
```bash
codex exec "Review implementation in these files:
- [path/to/file1.ts]
- [path/to/file2.ts]

Check against requirements in: [path/to/task/tech-decomposition.md]
Focus on: correctness, edge cases, error handling" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

---

## Security Review

### General Security Audit
```bash
codex exec "Perform a security review of the uncommitted changes. Check for:
- SQL/NoSQL injection
- XSS vulnerabilities
- Command injection
- Authentication/authorization issues
- Sensitive data exposure
- Input validation gaps

Report findings with severity levels (Critical/High/Medium/Low)." \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

### API Security Review
```bash
codex exec "Review [file/endpoint] for API security:
- Rate limiting
- Input validation
- Authentication checks
- Authorization (access control)
- Error handling (info leakage)
- CORS configuration" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

---

## Implementation Verification

### Feature Completion Check
```bash
codex exec "Verify implementation of [feature] is complete.

Requirements (from [task-file-path]):
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Key files:
- [file1]
- [file2]

Check: All requirements implemented? Edge cases handled? Error handling adequate? Tests cover key paths?" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

### Refactoring Verification
```bash
codex exec "Verify this refactoring preserves behavior:

Original behavior: [description]
Changed files: [files]

Check that:
1. All existing functionality preserved
2. No subtle behavior changes
3. No new edge case bugs introduced" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

---

## Test Assessment

### Test Coverage Review
```bash
codex exec "Review test coverage for [file/module].

Key functionality:
- [Function 1]
- [Function 2]

Check: Are all public functions tested? Edge cases covered? Error paths tested? What's missing?" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

---

## Performance & Bug Investigation

### Performance Analysis
```bash
codex exec "Analyze [file/function] for performance issues:
- Inefficient algorithms (O(n^2) etc.)
- Memory leaks or excessive allocation
- Blocking operations
- Missing caching opportunities
- N+1 query patterns" \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

### Bug Root Cause Analysis
```bash
codex exec "Help investigate this bug:

Symptom: [What's happening]
Expected: [What should happen]
Context: [Relevant context]
Suspected files: [files]

Find the root cause and suggest a fix." \
  -m MODEL -c model_reasoning_effort=xhigh --full-auto -o /tmp/codex-result.md > /dev/null 2>&1
```

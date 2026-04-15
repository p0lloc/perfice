# Cross-AI Validation Protocol

Output format reference for skills that run cross-AI validation.

## 1. Invoke Skills

Invoke `/codex-cli`, `/gemini-cli`, and `/cursor-cli` skills with the calling skill's **FOCUS** and **FILE_REFS**.
Each skill handles its own CLI availability checks, flags, models, and output parsing.

- **All three available** → invoke in parallel, then produce comparison table + validation (sections 2-4)
- **Two available** → invoke those two in parallel, produce comparison table + validation
- **One available** → invoke solo, skip comparison table, produce single-source verdict (section 4)
- **None available** → write `**Status**: SKIPPED — no cross-AI CLI available` → stop

## 2. Comparison Table (multi-agent mode only)

| # | Finding | Codex | Gemini | Cursor | Agreement |
|---|---------|-------|--------|--------|-----------|
| 1 | [description] | [severity or —] | [severity or —] | [severity or —] | YES / NO |

De-duplicate by semantic equivalence. "—" means that AI didn't flag it.
If severity differs, use the higher one.
When only two agents ran, omit the column for the absent agent.

## 3. Validation

For each finding, verify against actual code:

| # | Finding | Source | Valid? | Rationale |
|---|---------|--------|--------|-----------|
| 1 | ... | all / codex+gemini / codex+cursor / gemini+cursor / codex / gemini / cursor | VALID / INVALID | [evidence from code] |

- **VALID**: Verifiable in code. Propagates to verdict.
- **INVALID**: Factually wrong (wrong file, misread logic, non-existent pattern). Dropped with reason.
- **DISPUTED**: Some AIs found it, others didn't. Orchestrator checks code and decides.

Only VALID findings propagate to the consolidated verdict.

## 4. Consolidated Verdict

```
**Agents**: [list agents that ran] | **Mode**: Tri / Dual / Single ([which]) / Skipped
**Status**: PASSED / FAILED / PARTIAL
**Agreement rate**: X/Y findings (multi-agent mode only)
```

Status definitions:
- **PASSED** — 0 Critical, 0 Major valid findings
- **FAILED** — 1+ Critical or 3+ Major valid findings
- **PARTIAL** — One or more AIs unavailable/timed out; fewer than full coverage

Final findings table (VALID only):

| Severity | Finding | Source | Assessment |
|----------|---------|--------|------------|
| CRITICAL / MAJOR / MINOR / INFO | [description] | codex / gemini / cursor / codex+gemini / all / etc. | [brief note] |

---
name: deep-research
description: >-
  In-depth research on technical topics using web search, documentation, and codebase analysis.
  Use when asked to 'research', 'investigate', 'find out about', 'look into', 'dig into',
  'compare X vs Y', 'what's the best library for', 'how does X work', 'should we use',
  'find alternatives to', 'evaluate options for', 'what are others doing for',
  or explore unfamiliar technologies, libraries, or architectural patterns.
  Also triggers for technology evaluation, migration research, and dependency decisions.
  NOT for quick brainstorming (use /brainstorm), NOT for feature discovery (use /nf),
  NOT for static code analysis (use /code-analysis).
argument-hint: "[topic or question]"
context: fork
allowed-tools:
  - WebSearch
  - WebFetch
  - Read
  - Grep
  - Glob
  - Task
  - mcp__exa__web_search_exa
  - mcp__exa__get_code_context_exa
  - mcp__ref__ref_search_documentation
  - mcp__ref__ref_read_url
---

# Deep Research

> **Announcement**: Begin with: "I'm using the **deep-research** skill for in-depth technical research."

## Overview

Conduct comprehensive research on technical topics, synthesizing information from multiple sources. Since this runs in a forked context, explore extensively — only the final findings return to the main conversation.

## 1. Determine Research Depth

Not every request needs a 10-source report. Match the depth to the question:

| Depth | When | Output |
|-------|------|--------|
| **Quick** | Simple factual question, "how do I X", single-topic lookup | Direct answer with 1-2 sources |
| **Comparison** | "X vs Y", "which library for", "should we use" | Comparison table + recommendation |
| **Deep** | Technology evaluation, migration analysis, architectural decision | Full structured report |

If the user's intent is ambiguous, default to **Comparison** — it's the most common need.

## 2. Source Strategy

### Tool Priority (Exa-first)

Research tools should be used in this order — Exa provides the fastest, most code-aware results:

1. **`get_code_context_exa`** — code-oriented queries (API usage, library examples, patterns)
2. **`web_search_exa`** — broader technical topics, comparisons, ecosystem info
3. **`ref_search_documentation`** — only when Exa results seem outdated or contradictory
4. **`ref_read_url`** — read primary docs when clarification is needed
5. **`WebSearch` / `WebFetch`** — fallback for anything Exa/Ref can't reach

### Parallel Search

Since this runs in a fork, optimize for speed by launching parallel queries:
- Fire Exa code context + Exa web search simultaneously for different facets of the question
- While web results load, scan the local codebase (`Grep`, `Glob`) for relevant existing patterns
- Use multiple small, focused queries rather than one broad query

### Source Types

| Source | Best For |
|--------|----------|
| Official docs | Authoritative API/config info |
| GitHub repos | Real implementations, issue discussions, activity signals |
| Technical blogs | Best practices, gotchas, real-world experience |
| Stack Overflow | Common problems, community-vetted solutions |
| Local codebase | Integration points, existing patterns, constraints |

## 3. Research Strategies

**Technology Evaluation:**
1. Official documentation overview
2. GitHub — stars, recent activity, open issues, release cadence
3. Comparison articles (vs alternatives)
4. Real-world adoption signals (who uses it, at what scale)
5. Local codebase — integration points, migration effort

**Problem Solving:**
1. Error message / symptom search (Exa code context)
2. GitHub issues in relevant repos
3. Stack Overflow discussions
4. Official troubleshooting guides
5. Local codebase — similar patterns or workarounds

**Best Practices:**
1. Official style guides and recommendations
2. Community conventions (popular repos, conference talks)
3. Existing patterns in our codebase
4. Project preferences (read from CLAUDE.md)

## 4. Cross-Verification

- Never rely on a single source — triangulate across at least 2-3
- Verify claims against official docs
- Check publication dates — prefer content from the last 12 months
- Look for consensus; flag disagreements explicitly
- Be skeptical of AI-generated content in search results

## 5. Output Format

Adapt output to the research depth determined in step 1.

### Quick Answer
```
**Answer**: [concise answer]

**Source**: [url] — [what it confirmed]

**Caveat**: [any important limitations or conditions]
```

### Comparison
```
## [X] vs [Y] for [use case]

| Criteria | X | Y |
|----------|---|---|
| [criterion] | [assessment] | [assessment] |

**Recommendation**: [which and why, considering our project context]
**Sources**: [urls]
```

### Full Report
```markdown
# Research: [Topic]

**Question**: [what was investigated]
**Date**: [ISO date]
**Sources**: [count]

## Summary
[3-5 sentences answering the research question]

## Findings

### [Finding title]
**Confidence**: HIGH / MEDIUM / LOW
**Sources**: [list]
[details]

## Recommendations
1. [recommendation with rationale]
2. [recommendation with rationale]

## Sources
- [Source](url) — [what it provided]

## Open Questions
- [anything unresolved]
```

## 6. Project Context

Instead of relying on a static list, read project context dynamically:
- Check `CLAUDE.md` at the repo root for current stack and architecture
- Check `docs/` for project-specific constraints
- Check `package.json` / `tsconfig.json` for actual dependencies and versions
- Reference existing patterns in the codebase when making recommendations

This ensures recommendations stay aligned with the project as it evolves.

## 7. Before Returning

- [ ] Sources are cited with URLs
- [ ] Information is current (dates checked)
- [ ] Findings are relevant to our project context
- [ ] Recommendations are actionable (not just "it depends")
- [ ] Conflicting information is flagged, not hidden

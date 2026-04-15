---
name: grill-me
description: Use when a plan, design, or discovery document needs stress-testing for hidden assumptions, scope gaps, unresolved branches, or ambiguous wording; also when the user explicitly says "grill me".
---

# Grill Me

Pressure-test a plan or design until the remaining ambiguity is explicit, bounded, and easy to communicate.

## Core Behavior

- Ask one focused question at a time
- For each question, provide your recommended answer or default position
- If a question can be answered from the codebase or docs, explore there instead of asking the user
- Prefer exposing hidden assumptions over inventing extra scope

## When Invoked From Discovery

Prioritize:
- Unclear scope boundaries
- Missing states, flows, or edge cases
- Hidden assumptions
- Ambiguous wording a new reader could misinterpret
- Decision branches that materially change the feature shape

Avoid:
- Deep implementation detail unless it changes scope, user experience, risk, or constraints
- Speculative product expansion that should instead be captured as out of scope

## Stop Condition

Stop when:
- The main branches of the decision tree are resolved or explicitly cut
- The remaining ambiguity is minor and non-blocking
- The caller can clearly document flow, scope, constraints, and risks

## Return To Caller

Return a compact summary:
- Clarifications made
- Scope cuts or out-of-scope decisions
- Hidden assumptions uncovered
- Wording fixes or ambiguity reductions
- Remaining risks or blockers

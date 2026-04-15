---
name: blueprint
description: >-
  Turn a one-line objective into a multi-session implementation plan with cold-start briefs.
  Use when asked to 'blueprint', 'multi-session plan', 'long-term plan', 'construction plan',
  'break into sessions', 'plan across sessions', 'multi-step project plan', 'session plan',
  or when a feature is too large for a single Claude session. Produces a plan where each step
  can be executed independently by a fresh agent with no prior context.
argument-hint: "<objective>"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Agent
  - AskUserQuestion
  - WebSearch
  - WebFetch
---

# /blueprint — Multi-Session Construction Plan

> **Announcement**: Begin with: "I'm using the **blueprint** skill to create a multi-session plan."

## Purpose

Large features can't be completed in a single Claude session. This skill decomposes a high-level objective into a sequenced plan where each step:
1. Has a **cold-start context brief** — everything a fresh agent needs to execute without reading prior session history
2. Has **explicit dependencies** — which steps must complete first
3. Has **verification criteria** — how to confirm the step is done

## When to Use

- Feature spans multiple domains (backend + mobile + infra)
- Implementation will realistically take 3+ sessions
- Multiple developers/agents need to coordinate
- User says "this is a big one" or "break this down for me"

## Pipeline

### Phase 1: Research (understand the landscape)
1. Read relevant PRDs, JTBDs, and existing task docs
2. Explore the codebase areas that will be touched
3. Identify existing patterns to follow
4. List unknowns and risks

### Phase 2: Design (create the dependency DAG)
1. Break the objective into 3-8 implementation steps
2. Map dependencies between steps (which must come first?)
3. Identify parallelizable steps (can run simultaneously)
4. Estimate relative complexity (S/M/L) per step

### Phase 3: Draft (write step documents)
For each step, produce:

```markdown
## Step [N]: [Title]

### Cold-Start Brief
> A fresh Claude session should read ONLY this section to begin work.

**Objective**: [What this step accomplishes]
**Codebase entry points**: [Specific files/directories to read first]
**Patterns to follow**: [Existing code patterns this step should mirror]
**Key decisions already made**: [Design choices from Phase 2 that constrain this step]
**What exists before this step**: [State of the codebase when this step starts]

### Dependencies
- Blocked by: [Step X, Step Y] or "None — can start immediately"
- Blocks: [Step Z]

### Scope
- **In scope**: [Specific deliverables]
- **Out of scope**: [What NOT to do in this step]

### Acceptance Criteria
- [ ] [Criterion 1 — testable/verifiable]
- [ ] [Criterion 2]
- [ ] All tests pass: `[specific test command]`
- [ ] Type check passes: `cd client && npm run check`

### Estimated Complexity
[S / M / L] — [Brief justification]

### Suggested Task Command
`/ct` with this step's scope to create a full technical decomposition.
```

### Phase 4: Review (adversarial check)
Before presenting the plan, self-review:
1. **Completeness**: Does executing all steps achieve the original objective?
2. **Independence**: Can each step truly be executed by a fresh agent with only its cold-start brief?
3. **Ordering**: Are dependencies correctly captured? No circular dependencies?
4. **Gaps**: Are there implicit steps (migrations, config changes, env setup) that should be explicit?
5. **Rollback**: If step N fails, does it break steps 1..N-1?

## Output

Save the blueprint to: `docs/superpowers/plans/YYYY-MM-DD-<feature-slug>.md`

```markdown
# Blueprint: [Feature Name]

**Objective**: [The original one-line objective]
**Created**: [Date]
**Steps**: [N]
**Estimated sessions**: [N]
**Parallelizable steps**: [List]

## Dependency Graph
```
Step 1 ─── Step 2 ─── Step 4
              │
              └── Step 3 ─── Step 5
```

## Steps

[Step documents from Phase 3]

---

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk 1] | [H/M/L] | [Strategy] |

## Open Questions
- [Question that needs user input before execution]
```

## Integration

- Each step can be turned into a `/ct` task document for detailed decomposition
- Steps can reference existing task docs in `tasks/` if they already exist
- The blueprint itself is a living document — update it as steps complete

## Constraints

- **Cold-start briefs must be self-contained** — a fresh agent should NOT need to read the full blueprint, only its step's brief
- **Keep steps focused** — each step should be completable in a single session (1-3 hours of agent work)
- **Don't over-plan** — later steps can be intentionally vague; refine them as earlier steps complete
- **No implementation** — this skill produces a plan, not code. Use `/si` to execute steps.

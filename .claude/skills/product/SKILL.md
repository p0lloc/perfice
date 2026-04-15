---
name: product
description: >-
  Create JTBD or PRD product documentation through an interactive interview process.
  Use when asked to 'create JTBD', 'write a PRD', 'product requirements', 'jobs to be done',
  'product documentation', 'product spec', or when a feature needs formal product-level
  documentation before technical planning. Conducts research, interviews, and pressure-tests
  the product thinking before writing. NOT for technical decomposition (use /ct),
  NOT for feature discovery (use /nf).
argument-hint: jtbd [feature] | prd [feature] | quick jtbd [feature] | quick prd [feature]
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, Task, Skill
---

# Product Documentation

> **Announcement**: Begin with: "I'm using the **product** skill for product documentation creation."

## Objective
Create best-in-class JTBD or PRD documents through a structured interview, mandatory research, and pressure-testing process. The output should be a standalone document that any team member can read and understand without extra verbal context.

## Guidelines
- **Use `AskUserQuestion` tool for ALL clarifications** — never assume behavior, needs, or context
- Ask non-obvious and thought-provoking questions; actively challenge assumptions
- Focus on user progress and context, not features or demographics
- A job statement describes progress the user wants to make — not a feature request
- Work with the templates as output contracts throughout the interview
- Research is MANDATORY — product decisions without research are assumptions
- Do not include any time estimates

## Workflow

### Argument Validation

**Parse `$ARGUMENTS`:**
- `jtbd [feature]` or `cjtbd [feature]` → full-flow JTBD
- `prd [feature]` or `cprd [feature]` → full-flow PRD
- `quick jtbd [feature]` → quick mode JTBD (skip to Step 5)
- `quick prd [feature]` → quick mode PRD (skip to Step 5)
- `[feature]` only → `AskUserQuestion`: "Which document type?" Options: "JTBD — Jobs-to-be-Done analysis" / "PRD — Product Requirements Document"
- No argument → `AskUserQuestion`: "What feature?" + free-text option, then ask document type

**Quick mode**: When `quick` prefix is detected, skip directly to Step 5 (document writing). Read templates, fill from available context, mark unknowns with `[NEEDS CLARIFICATION: ...]`. Present output with note: "Quick mode used. For deeper product thinking, run the full `/product` flow."

### Step 0: Load the Output Shape

Before asking questions, read the templates to understand the expected structure:
1. Read `.claude/docs/templates/JTBD-template.md`
2. Read `.claude/docs/templates/PRD-template.md`

Treat the templates as **output contracts** — the interview gathers exactly the information needed to fill them clearly.

**For PRD**: Check whether an existing JTBD already exists in `product-docs/JTBD/JTBD-*[feature-name]*.md`. If it does, load it as input context — the PRD builds on the JTBD.

### Step 1: Context Gathering & Design Exploration

**Invoke the `design-exploration` skill** to ground product documentation in codebase reality.

When invoking, ask it to return:
- Key codebase findings and current fit for the feature area
- Existing patterns, modules, or flows related to the feature
- Constraints discovered in the existing system
- Risk flags or open decisions

For product documentation, prefer fit, constraints, and risks over implementation decomposition.

**Checkpoint:** Present findings summary. `AskUserQuestion`: "Does this context align with what you're building?" Options: "Yes, continue" / "I have corrections" / "Skip codebase context"

### Step 2: Research (MANDATORY)

Research is not optional. Both JTBD and PRD templates have mandatory Research Findings sections that must be filled with cited sources.

**Quick lookups** (Exa MCP tools directly):
- Competitor approaches to the same job/problem
- Industry best practices for the feature type
- Market signals and opportunity indicators

**In-depth research** (spawn `comprehensive-researcher` agent):
Only when findings materially affect the job statement, scope boundaries, or requirements. When invoking, request a **concise decision memo**:
- Key findings relevant to the product framing
- Implications for job statement or requirements
- Competitive landscape signals
- Risks or caveats

**JTBD research focus**: switching behavior, competitive alternatives being "hired" today, outcome benchmarks, user job patterns
**PRD research focus**: how similar products solve this problem (with specific examples), feature specifications, success metrics benchmarks, UX patterns

**Checkpoint:** Present research summary. `AskUserQuestion`: "Key findings reviewed. Ready for interview?" Options: "Continue to interview" / "Research a specific topic further"

### Step 3: Deep-Dive Interview

Drive the conversation section-by-section toward filling the template. Ask 2-3 questions per round. After each round, summarize what was gathered and which template section it fills.

---

**JTBD Interview Sections:**

**Job Statement:**
- Walk me through the situation — what moment triggers the need?
- What does the user want to accomplish (their motivation)?
- What does success look like for them (expected outcome)?
- Propose 2-3 candidate job variants — which resonates most?

**Success Criteria:**
- Functional: what are the objective requirements for getting this job done?
- Emotional Personal: how does the user want to feel during/after?
- Emotional Social: how does the user want to be perceived by others?

**Four Forces of Switching:**
- Push: what's broken, slow, or painful about how they do it today?
- Pull: what better future does the new solution promise?
- Anxiety: what could go wrong? What fears exist about switching?
- Habit: what's comfortable about the current way? What switching costs exist?
- What are they "hiring" today for this job? (Include non-consumption)

**User Context:**
- Who is the primary user — defined by circumstances, not demographics?
- What events trigger them to seek a solution?
- What constraints affect their usage?

---

**PRD Interview Sections** (in addition to shared context from JTBD):

**Problem & Evidence:**
- What pain exists and who feels it?
- What evidence proves this is a real problem? (user quotes, data, tickets)
- Why does solving this matter for the business?

**Non-Goals:**
- What are we explicitly NOT building in this version?
- Where could scope accidentally expand?

**Goals & Metrics:**
- What does success look like at launch?
- How will we measure it? (require: number + timeframe + measurement method)
- What metrics must NOT degrade?

**User Stories & Requirements:**
- What are the 3-5 key user stories?
- For each: what proves it's done? (acceptance criteria)
- Priority: what's P0 (must-have) vs P1 (should-have) vs P2 (nice-to-have)?
- Non-functional: performance, security, accessibility targets?

**Solution Shape:**
- What is the core user flow (3-6 steps)?
- What are the key states (loading, empty, error, success)?
- What business rules or constraints apply?

---

Continue until the template can be filled clearly. Use multiple-choice options in `AskUserQuestion` when there are clear alternatives. Challenge assumptions — do not be a yes-agent.

### Step 4: "Grill Me" Challenge Round

**Invoke the `/grill-me` skill** to pressure-test the product documentation shape before writing.

**Before invoking**, summarize the current state:
- Feature name and description
- (JTBD) Primary job statement, success criteria, four forces
- (PRD) Problem + evidence, goals, key requirements
- Areas of uncertainty or risk

**JTBD grill priorities:**
- Is the job statement truly a user job, not a feature request?
- Are the four forces balanced — or is anxiety/habit being ignored?
- Are success criteria measurable or vague?
- Does the competitive analysis reflect genuine switching behavior?

**PRD grill priorities:**
- Are the requirements complete enough for `/ct` to proceed?
- Do user stories have testable acceptance criteria?
- Is the scope boundary clear? Where could scope creep?
- Are there hidden dependencies or assumptions?

**After the grill session completes:**
Incorporate findings. Tighten unclear wording, scope boundaries, hidden assumptions.

**Checkpoint:** `AskUserQuestion`: "How should we proceed?" Options: "Proceed to document writing" / "Revisit based on grill findings" / "Cut scope based on findings"

### Completion Check

Before writing, confirm a new reader can answer without extra verbal context:

**For JTBD:** What job is being done? By whom and when? What are the success criteria? What forces drive or prevent the switch? What alternatives exist today?

**For PRD:** All of the above, plus: What's the problem and evidence? What are the goals and metrics? What are the key requirements? How does the solution work? What's in/out of scope?

If any remain unclear, continue the interview.

### Step 5: Document Writing

1. **Re-read template** if needed to confirm structure
2. **Create output directory** if it doesn't exist
3. **Write the document(s)**:
   - JTBD output: `product-docs/JTBD/JTBD-[feature-name].md`
   - PRD output: `product-docs/PRD/PRD-[feature-name].md`
4. **For PRD without prior JTBD**: If the interview gathered sufficient JTBD data (which it should from the shared questions), also write the JTBD document for traceability
5. **If any required section cannot be filled clearly**, continue the interview instead of writing placeholder content
6. **Present summary** to user for confirmation

### Step 6: Cross-AI Validation

**Important:** Do not guess or improvise the underlying CLI commands. The skill initialization step is mandatory for each validator.

**Invoke skills sequentially first:**
1. Invoke `/codex-cli`
2. Invoke `/gemini-cli`
3. Invoke `/cursor-cli`

**Only after all three skills are invoked**, launch the three validation runs in parallel.

Format output per `.claude/docs/templates/cross-ai-protocol.md` (comparison table, validation, verdict).

**JTBD focus:** Job statement clarity, four-forces coherence, success criteria measurability, absence of solution bias in job framing
**PRD focus:** Requirements completeness for `/ct`, acceptance criteria testability, scope boundaries, metrics measurability, consistency with JTBD reference

**FILE_REFS:** `JTBD-[feature-name].md` and/or `PRD-[feature-name].md` + relevant codebase paths
**OUTPUT:** Append "Cross-AI Validation: PASSED/FAILED" with consolidated verdict

**If validation fails:** `AskUserQuestion`: "Revise document" / "Override and proceed" / "Abandon"

**Skip conditions:** No CLI available, or user explicitly skips.

## Output
- JTBD: `product-docs/JTBD/JTBD-[feature-name].md`
- PRD: `product-docs/PRD/PRD-[feature-name].md`

## Handoff — Next Steps

Product docs are long-lived artifacts that span multiple tasks. The canonical workflow after `/product`:

```
Product documentation complete for [feature-name]:
- Document: product-docs/[PRD|JTBD]/[PRD|JTBD]-[feature-name].md

Next steps:
→ Discover a specific feature from the PRD: /nf [feature-name]
→ Skip to tech planning: /ct [feature-name]
→ Visualize the design: /vp [feature-name]
→ Consistency check: /analyze [feature-name]
```

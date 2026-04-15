---
name: nf
description: >-
  Conduct in-depth feature discovery interview to explore, challenge, and document a new feature.
  Use when asked to 'detail a feature', 'explore a new feature', 'feature discovery',
  'interview about feature', 'spec out a feature', 'design a feature',
  'think through a feature', 'let's spec this out', 'deep dive on a feature',
  'what should we consider for [feature]', or 'discover [feature-name]'.
  NOT for quick brainstorming (use /brainstorm),
  NOT for PRD/JTBD docs (use /product), NOT for implementation tasks (use /ct).
argument-hint: [feature-description]
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, Task, Skill
---

# New Feature Discovery

> **Announcement**: Begin with: "I'm using the **nf** skill for feature discovery."

## Objective
Conduct a discovery interview that turns a rough feature idea into a clear, easy-to-read discovery document. The output should serve as the entry point for anyone who later needs to visualize, plan, or implement the feature.

## Guidelines
- **Use `AskUserQuestion` tool for ALL clarifications**
- **Never assume behavior**: if any behavior is unclear/ambiguous (UX flow, edge cases, error handling, states), ask the user to define expected behavior
- Ask non-obvious and thought-provoking questions
- Actively challenge assumptions; do not be a yes-boy. Grill.
- Offer alternatives, shortcuts, and "go deeper" paths
- Continue until the feature is fully understood
- Work with the final discovery template in mind throughout the interview
- Gather exactly the information needed to fill the discovery document clearly

## Workflow

### Argument Validation

**If no `[feature-description]` argument is provided:**
1. Use `AskUserQuestion`: "What feature would you like to explore?"
   - Include a free-text "Describe a new feature" option
2. Derive the feature-name slug from the user's response

### Step 0: Load the Output Shape and Upstream Context

Before asking deep-dive questions, read `.claude/docs/templates/discovery-template.md` to understand the expected structure, level of clarity, and final shape of the discovery document.

Treat the template as the **output contract**:
- It defines what the final document should contain
- The discovery interview should gather exactly the information needed to fill it clearly
- Do not duplicate the template structure inside this skill; use the template itself as the source of truth for the final document shape

**Load upstream product docs** (if they exist):
- Check `product-docs/PRD/PRD-*[feature-name]*.md` for an existing PRD
- Check `product-docs/JTBD/JTBD-*[feature-name]*.md` for an existing JTBD
- If found, read them as input context — they define the product-level "what and why" that this discovery will explore in depth. Reference them in the discovery document.

### Step 1: Context Gathering & Design Exploration

**Invoke the `design-exploration` skill** to ground discovery in the real codebase.

When invoking, ask it to return:
- Key codebase findings and current fit
- Viable design directions
- Constraints discovered in the existing system
- Risk flags or open decisions

For discovery work, prefer fit, options, constraints, and risks over implementation decomposition.

**Checkpoint:** Present findings summary and initial approach. `AskUserQuestion`: "Does this direction look right?" Options: "Continue with this approach" / "Explore a different direction" / "I have corrections"

### Step 2: External Research (If Needed)

When you need current information, best practices, or technical research:

- **Quick lookups**: Use Exa MCP tools directly
- **In-depth research**: Spawn `comprehensive-researcher` only when the answer materially affects the chosen direction, scope boundaries, key requirements, or constraints.

When invoking `comprehensive-researcher`, ask for a **concise decision memo for discovery**, not a broad general report by default. The memo should return:
- Key findings
- Implications for feature shape or scope
- Risks or caveats
- Unresolved external unknowns

Topics to research:
- Industry best practices for the feature type
- Competitor implementations and patterns
- API/library capabilities and limitations
- Security considerations and compliance requirements

### Step 3: Deep-Dive Questions

Drive the conversation toward the sections of the discovery template. Ask additional **non-obvious** questions until the final document can be filled clearly and read as a standalone entry point.

**Feature Overview / Why This Exists:**
- What is the feature in plain language?
- What problem or opportunity does it address?
- Why does it matter now?
- What value should it create for the user or product?

**Usage Context** (only if it adds clarity):
- Who is the primary user or actor?
- When does this feature matter?
- What surrounding context, prior state, or constraints affect usage?

**Chosen Direction** (only if multiple viable approaches exist):
- What direction was selected?
- What alternatives were considered?
- Why is this direction preferred?

**How It Works:**
- Entry points
- Main happy path
- Key states (loading, empty, error, success, variants)
- Important edge cases that materially shape the feature

**Scope Boundaries:**
- What is explicitly in scope for this version?
- What is explicitly out of scope?
- Where could the scope accidentally expand?

**Key Requirements / Constraints:**
- Must-have behaviors
- Integration points and dependencies
- Security, accessibility, performance, privacy, or platform limitations that materially shape the feature
- Assumptions the downstream implementation must preserve

Continue deep-dive until the user confirms the document is clear, scoped, and ready to stand on its own.

### Step 4: "Grill Me" Challenge Round

Now that the draft shape is clear, **invoke the `/grill-me` skill** to pressure-test the feature design and the document's clarity.

**Before invoking**, summarize the current state for the grill session:
- Feature name and description
- Why this exists
- Chosen direction (if any)
- How it works
- In scope / out of scope boundaries
- Key requirements and constraints
- Any areas of uncertainty or risk already identified

**After the grill session completes:**
- Incorporate all findings and decisions back into the feature understanding
- Tighten unclear wording, scope boundaries, hidden assumptions, and missing states or edge cases

**Checkpoint:** `AskUserQuestion`: "How should we proceed?" Options: "Proceed to discovery document" / "Revisit design based on findings" / "Cut scope based on grill findings"

### Completion Check

Before writing the final discovery document, confirm that a new reader can answer without extra verbal context:
- What is this feature?
- Why does it exist?
- How does it work?
- What is in scope?
- What is out of scope?
- What requirements or constraints materially shape it?

If any of those remain unclear, continue discovery instead of finalizing the document.

### Step 5: Discovery Document Writing

After interview completion:

1. **Re-read template if needed**: Review `.claude/docs/templates/discovery-template.md` to confirm the expected structure and clarity level
2. **Create task directory**: `tasks/task-YYYY-MM-DD-[feature-name]/`
3. **Write discovery document** by filling the template with the decisions, flows, scope boundaries, requirements, and constraints resolved during discovery
   - Output file: `discovery-[feature-name].md`
4. **If any required section cannot be filled clearly**, continue discovery instead of finalizing the document
5. **Present summary** to user for confirmation


### Step 6: Cross-AI Validation

**Important:** Do not guess or improvise the underlying CLI commands. The skill initialization step is mandatory for each validator.

**Invoke skills sequentially first:**
1. Invoke `/codex-cli`
2. Invoke `/gemini-cli`
3. Invoke `/cursor-cli`

**Only after all three skills are invoked**, launch the three validation runs in parallel. Do not wait for Codex to finish before starting Gemini, and do not wait for Gemini to finish before starting Cursor. The `invoke` steps happen one-by-one; the review runs happen concurrently after initialization.

Format output per `.claude/docs/templates/cross-ai-protocol.md` (comparison table, validation, verdict).

- **FOCUS**: Discovery document review as senior product analyst — entry-point readability, completeness, consistency, flow clarity, scope boundaries, feasibility, and hidden ambiguities that would cause confusion in `/vp` or `/ct`
- **FILE_REFS**: `discovery-[feature-name].md` + relevant codebase paths
- **OUTPUT**: Append "Cross-AI Validation: PASSED/FAILED" with consolidated verdict

**If validation fails**: Present valid findings via `AskUserQuestion`: "Revise discovery doc" / "Override and proceed" / "Abandon feature".

**Skip conditions**: No CLI available, or user explicitly skips.

## Output
`tasks/task-YYYY-MM-DD-[feature-name]/discovery-[feature-name].md`

## Handoff — Next Steps

After discovery is complete, present to the user:
```
Discovery complete for [feature-name]:
- Document: tasks/task-YYYY-MM-DD-[feature-name]/discovery-[feature-name].md

Next steps:
→ Visualize the design: /vp [feature-name]
→ Skip to tech planning: /ct [feature-name]
``
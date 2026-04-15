---
name: brainstorm
description: >-
  Collaborative brainstorming session on any topic — project-related or general.
  Use when asked to 'brainstorm', 'let's brainstorm', 'explore ideas', 'think through',
  'brainstorm about [topic]', 'what are our options for', 'let's think about',
  'pros and cons of', 'help me decide', or 'weigh the options'.
  NOT for feature discovery (use /nf),
  NOT for PRD/JTBD docs (use /product), NOT for deep research (use /deep-research),
  NOT for pre-implementation design (auto-triggered by design-exploration skill).
argument-hint: [topic]
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, Agent, Skill
---

# Brainstorming Session

> **Announcement**: Begin with: "I'm using the **brainstorm** skill for collaborative brainstorming."

## Objective
Conduct a collaborative brainstorming session through natural dialogue, exploration of options, and structured capture of insights. Brainstorms can be project-related or general — the skill adapts its depth and tooling accordingly.

## Guidelines
- **Use `AskUserQuestion` tool for ALL clarifications** — provides interactive options for user to choose from
- Ask **non-obvious and thought-provoking** questions that challenge assumptions
- Present multiple perspectives and approaches
- Capture key insights and decisions in the brainstorm notes

## Argument Validation

**If no `[topic]` argument is provided:**
1. Use `AskUserQuestion`: "What would you like to brainstorm about?"
   - Search `docs/brainstorming/` for recent brainstorms as context
   - Search `tasks/` for in-progress work that might spark ideas
   - Include a free-text option
2. Derive the topic slug from the user's response

## Resume Check

Before starting a new session, check for existing drafts:
1. Search for `docs/brainstorming/brainstorm-*-[topic-slug].md`
2. If found:
   - Read the existing document
   - `AskUserQuestion`: "Found an existing brainstorm on this topic."
     Options: "Continue from where we left off" / "Start fresh" / "Review and build on it"
   - **Continue**: identify which sections are complete, pick up from the first incomplete area
   - **Start fresh**: proceed with full workflow
   - **Review**: present existing document for feedback, then expand

## Workflow

### Step 1: Calibrate Depth

Brainstorms vary widely in scope. Quickly assess what kind of session this is — the answer shapes everything else (how many questions to ask, whether to research, how formal the capture should be).

`AskUserQuestion` with options:
- **Quick decision** — "I need to pick between a few options" (5-10 min, 2-3 questions, lightweight capture)
- **Exploration** — "I want to think through something" (15-30 min, structured exploration, standard capture)
- **Deep dive** — "This is a big topic, let's go deep" (30+ min, full exploration with research, detailed capture)

### Step 2: Context Gathering (Adaptive)

Context gathering is not a gate — it happens organically as the brainstorm progresses. Start with what's immediately relevant and pull in more context as needed.

**For project-related topics:**
- If the topic clearly touches existing code, invoke the `design-exploration` skill to scan the codebase
- If the scope is unclear, start with the brainstorm conversation and invoke design-exploration later when specific areas of the codebase become relevant

**For general topics:**
- Skip codebase context entirely
- Jump straight to exploration

### Step 3: Exploration

The core of the brainstorm. Adapt the depth to the calibration from Step 1.

**Understanding the Topic:**
- Ask clarifying questions (batch related questions via `AskUserQuestion`)
- Focus on: goals, constraints, success criteria, concerns

**Exploring Approaches:**
- Propose 2-3 different perspectives or options
- Present trade-offs clearly using a consistent format:
  - Option name, brief description, pros, cons
- Lead with your recommendation and reasoning

**Deep Exploration** (for Exploration/Deep Dive depth):

| Category | Questions to Consider |
|---|---|
| **Practical** | What could go wrong? Edge cases? Resources needed? How does this scale? |
| **Assumptions** | What are we assuming? Who else is affected? What's the opposite approach? |
| **Impact** | How do we measure success? What's the MVP? What if we don't do this? |
| **Trade-offs** | Speed vs quality? Short-term vs long-term? Complexity vs simplicity? |

Present ideas in 200-300 word sections and validate understanding after each section before continuing. Be ready to pivot if direction changes.

**Completion signals** — the brainstorm is "done" when:
- For Quick Decision: user has enough info to decide
- For Exploration: all major angles have been discussed and user confirms
- For Deep Dive: all question categories explored, user has no more "what about..." questions

### Step 4: Research (When Needed)

Launch research proactively when the conversation reveals knowledge gaps — no permission needed. Inform the user what's being researched and continue brainstorming while agents work in the background.

**Quick lookups:**
- `get_code_context_exa` — for code-related context, APIs, libraries
- `web_search_exa` — for trends, market data, best practices

**In-depth research:**
- Spawn `comprehensive-researcher` agent via Agent tool for topics requiring multiple sources and cross-verification
- Launch multiple researcher agents simultaneously for different sub-topics

**Code context (project-related):**
- Use Explore agents (Sonnet) to scan relevant modules, patterns, and prior art

**Trigger research when:**
- Topic requires current or up-to-date information
- Market trends, competitor analysis, or industry standards are relevant
- Technical decisions benefit from external validation
- Knowledge gaps are identified during exploration

### Step 5: Capture

After exploration is complete, create the brainstorm artifact. The format adapts to the session depth.

**For Quick Decision depth:**
- `AskUserQuestion`: "Want me to save these notes, or was the conversation enough?"
  - If no: skip capture entirely — the conversation itself is the artifact
  - If yes: write a brief summary (skip the full template)

**For Exploration / Deep Dive depth:**
1. Create brainstorm notes: `docs/brainstorming/brainstorm-YYYY-MM-DD-[topic-slug].md`
2. Use template: `.claude/docs/templates/brainstorm-template.md`
3. Include:
   - Topic overview and type (project/general)
   - Key questions explored
   - Options discussed with pros/cons
   - Conclusions and insights
   - Research findings (if any)
   - Action items (if any)
4. Present summary to user for confirmation

### Step 6: Next Steps

After capture, offer a natural handoff to the next skill based on what emerged from the brainstorm.

`AskUserQuestion`: "What would you like to do next?"
- **"Create a feature spec"** — invoke `/nf` with the topic context
- **"Create a task"** — invoke `/ct` with conclusions as input
- **"Write a PRD"** — invoke `/product` with brainstorm insights
- **"Nothing, we're done"** — wrap up

Skip this step for general (non-project) brainstorms unless the user explicitly wants to act on the results.

## Scope Boundaries
- Feature discovery interviews: use `/nf`
- PRD/JTBD documentation: use `/product`
- Deep technical research: use `/deep-research`
- Pre-implementation design: auto-triggered by `design-exploration` skill (not this one)
- Task creation: use `/ct`

## Output
`docs/brainstorming/brainstorm-YYYY-MM-DD-[topic-slug].md` (optional for Quick Decision depth)

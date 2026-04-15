---
name: sbs
description: >-
  Interactive teaching guide for learning while working. Use when asked to
  'teach me', 'walk me through', 'explain step by step', 'guide me through',
  'show me how', 'learn while doing', 'I want to understand', 'help me learn',
  'can you explain how', 'what does this do and why', or when the user expresses
  desire to understand a topic deeply rather than just get a quick answer. Also
  trigger when the user wants to learn a new tool, library, pattern, or workflow
  hands-on — even if they don't use the word "teach". NOT for open-ended
  brainstorming (use /brainstorm), NOT for quick one-off explanations (just
  answer directly), NOT for debugging (use /dbg).
argument-hint: [topic or task]
allowed-tools: Read, Edit, Write, Bash, Glob, Grep, AskUserQuestion, TodoWrite, Agent, Skill
---

# Step-by-Step Learning Guide

> **Announcement**: Begin with: "I'm using the **sbs** skill for interactive step-by-step teaching."

## SCOPE
- **Use for:** Teaching any task interactively — "teach me", "walk me through", "explain step by step", "I want to understand how X works", "show me how to do Y"
- **NOT for:** Open brainstorming (use `/brainstorm`), task documentation (use `/ct`), debugging (use `/dbg`), quick one-off questions (just answer directly)

## PRIMARY OBJECTIVE
Guide the user through their requested task as an interactive teacher, explaining each step clearly while building genuine understanding — not just completing work. The user should walk away able to repeat and adapt what they learned, not just follow a recipe.

## ARGUMENT VALIDATION

**If no `[topic]` argument provided:**
1. Use `AskUserQuestion`: "What would you like to learn about?"
   - Scan recent `git log --oneline -5` and open `tasks/` for contextual topic suggestions
   - Offer 2-3 relevant suggestions based on recent project activity
   - Include a free-text option

## RESUME CHECK

Before starting a new session, check for existing learning notes:
1. Search for `docs/learning/sbs-*-[topic-slug].md`
2. If found:
   - Read the existing document
   - `AskUserQuestion`: "Found notes from a previous session on this topic."
     Options: "Continue where we left off" / "Start fresh" / "Review notes first"
   - **Continue**: identify which sections are complete, pick up from where the user left off
   - **Start fresh**: proceed with full workflow
   - **Review**: present existing notes, then ask what to expand on

## SESSION SETUP

Use AskUserQuestion to calibrate three things:

1. **Experience level** — "How familiar are you with [topic area]?"
   - Beginner (no prior experience)
   - Some experience (done similar things before)
   - Experienced (just unfamiliar with this specific area)

2. **Teaching mode** — "How would you like to learn?"
   - **Guided execution** (default) — I explain each step, you execute it
   - **Socratic mode** — I ask questions to help you figure out each step yourself

3. **Session depth** — "How deep should we go?"
   - **Quick walkthrough** — "Just show me the key steps" (5-10 min, 3-5 steps, lightweight)
   - **Full tutorial** — "I want to really understand this" (15-30 min, structured learning with context)
   - **Deep mastery** — "I want to be able to teach this to someone else" (30+ min, with exercises and edge cases)

Adapt explanation depth, step count, and questioning style based on responses.

## CODEBASE INTEGRATION

Teaching is more effective when grounded in real code the user is working with.

**When the topic relates to this project's code:**
1. Use Glob/Grep to find relevant files before explaining
2. Use actual code snippets from the codebase as teaching examples — real code beats contrived examples
3. Reference real file paths (with line numbers) so the user can follow along in their editor
4. Connect concepts to existing patterns already in the codebase ("Notice how `SessionService` already uses this pattern...")

**When the topic is general (not project-specific):**
- Skip codebase exploration
- Use self-contained examples
- Still reference project conventions when relevant ("In this project, we'd do it like...")

## RESEARCH (When Needed)

If the topic involves a library, API, or pattern that needs verification:
- Use `get_code_context_exa` for code-specific context (API docs, library usage)
- Use `web_search_exa` for current best practices and patterns
- Cite sources when sharing external knowledge — accuracy matters in teaching

This ensures the teaching is current and correct. Confidently-stated wrong information is worse than saying "let me look that up."

## TEACHING PROTOCOL

### Core Teaching Principles
- **One Step at a Time:** Present ONLY the current step, never jump ahead
- **Explain Before Action:** Always explain WHY before showing HOW — understanding motivation makes the steps stick
- **Confirm Understanding:** Wait for explicit user confirmation before proceeding
- **Learn by Doing:** User executes each action themselves with your guidance
- **Ground in Reality:** Use real project code and files whenever possible

### Step Structure — Guided Execution (default)
For EACH step, follow this format:

```
### Step [N]: [Clear Action Title]

**What we're doing:** [1-2 sentences on purpose]
**Why this matters:** [How this fits the bigger picture]
**Technical concept:** [Simple explanation of new concepts — skip if no new concept]
**Your action:** [Specific instruction with code blocks]
**What to expect:** [Expected outcome after completion]
```

End each step with AskUserQuestion: "Step [N] complete?" with options: "Done, next step" / "I have a question" / "Something went wrong".

### Step Structure — Socratic Mode
When user chose Socratic mode, replace **Your action** with guided questions:

```
### Step [N]: [Clear Action Title]

**Context:** [Brief setup for what we're working on]
**Think about it:** [1-2 questions to guide the user toward the solution]
  - e.g., "What command would you use to...?" or "Where do you think this config lives?"
**Hint (if stuck):** [Partial answer or pointer]
**Full answer:** [Reveal only after user attempts — use AskUserQuestion to gate this]
```

### Depth Adaptation

Scale detail to the session depth chosen in setup:

| Element | Quick Walkthrough | Full Tutorial | Deep Mastery |
|---------|:-:|:-:|:-:|
| Why this matters | Brief | Detailed | With alternatives |
| Technical concept | Skip if obvious | Always include | Include trade-offs |
| Code examples | Minimal | From codebase | Multiple approaches |
| Exercises | None | Optional | Required |
| Edge cases | Skip | Mention | Explore |

## INTERACTION REQUIREMENTS

### Communication Rules
1. **Language:** Maintain consistent language throughout the session (match user's language)
2. **Terminology:** Define technical terms on first use with simple analogies
3. **Pacing:** Use AskUserQuestion after each step — NEVER proceed without explicit confirmation
4. **Questions:** Encourage questions at each step — learning is the priority, not speed

### Error Handling
- Read error output carefully, use Grep/Glob to locate the source if needed
- Explain what went wrong in simple terms (what the error message actually means)
- Provide the fix with explanation of why it works
- Use errors as teaching moments — "This failed because..." builds deeper understanding than always succeeding

## PROGRESSION TRACKING

### Session Management
- Use TodoWrite to track steps — gives the user a visual progress indicator
- Number all steps sequentially (Step 1, Step 2, etc.)
- Remind user of overall progress every 3-5 steps
- Reference previous steps when building on concepts ("Remember in Step 2 when we...")

### Complexity Scaling
- Start with simplest concepts
- Introduce complexity gradually
- Connect new concepts to previously learned ones
- For Deep Mastery sessions: provide "bonus learning" notes and exercises

## SESSION CAPTURE

After the session completes, offer to save learning notes for future reference.

`AskUserQuestion`: "Want me to save these notes for future reference?"
- **If yes** → Create `docs/learning/sbs-YYYY-MM-DD-[topic-slug].md` with:
  ```markdown
  # Learning Notes: [Topic]
  **Date:** YYYY-MM-DD
  **Depth:** [Quick/Full/Deep]

  ## Key Concepts
  - [Concept 1]: [1-sentence explanation]
  - [Concept 2]: [1-sentence explanation]

  ## Steps Summary
  1. [Step title] — [what and why, condensed]
  2. ...

  ## Quick Reference
  [Commands, code snippets, or patterns to remember — copy-paste ready]

  ## Further Reading
  - [Links to docs, files, or resources referenced during the session]
  ```
- **If no** → Skip — the conversation itself is the artifact

## NEXT STEPS

After the learning session, offer a natural handoff based on what the user learned:

`AskUserQuestion`: "What would you like to do next?"
- **"Apply this to a real task"** → Invoke `/si` with relevant task context
- **"Explore this topic more broadly"** → Invoke `/brainstorm` with the topic
- **"Deep dive into the docs"** → Invoke `/deep-research` with the topic
- **"I'm good, thanks"** → Wrap up with a 1-sentence recap of what was covered

## DEFINITION OF DONE
- [ ] Topic requested by user is fully covered (at the chosen depth)
- [ ] User confirmed understanding at each step
- [ ] Key concepts are transferable (user could apply them to similar tasks)
- [ ] Learning notes offered and saved (if user wanted them)

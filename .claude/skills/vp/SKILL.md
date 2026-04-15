---
name: vp
description: >-
  Create interactive visual prototype playground for user approval before technical decomposition.
  Use when asked to 'create prototype', 'visual mockup', 'preview design', 'design playground',
  'show me the feature', 'what would this look like', 'mockup the UI', 'visualize the architecture',
  'preview before building', 'let me see the design', or anytime the user wants to see or approve
  a visual representation of a feature before coding begins. Also trigger when /nf discovery is
  complete and the user says 'looks good, let's see it', 'now show me', or 'visualize this'.
  NOT for brainstorming (use /brainstorm), NOT for feature discovery (use /nf),
  NOT for implementation tasks (use /ct), NOT for quick one-off diagrams (use /generate-web-diagram).
argument-hint: [task-directory or feature-name]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, AskUserQuestion
---

# Visual Prototype Command

> **Announcement**: Begin with: "I'm using the **vp** skill for visual prototype creation."

## Purpose

Create an interactive HTML playground so the user can see and approve a feature's design before committing to technical decomposition. This bridges the gap between discovery (`/nf`) and implementation planning (`/ct`).

Works for both UI-facing tasks (mobile/web screen mockups) and backend tasks (architecture diagrams with Mermaid.js).

**Routing — wrong skill?**
- Feature discovery/interview → `/nf`
- Technical decomposition → `/ct`
- Implementation/coding → `/si`
- Brainstorming ideas → `/brainstorm`
- Quick one-off diagram → `/generate-web-diagram`
- Component lookup → `/component-library`

---

## GATE 0: Task Discovery

1. **Locate task directory:**
   - If argument provided: match against `tasks/task-YYYY-MM-DD-*[argument]*/`
   - If no argument: list recent task directories, ask user to select

2. **Check for discovery document:**
   - Look for `discovery-[feature-name].md` in task directory
  - **If found:** read it, extract feature overview, how it works, scope boundaries, key requirements, and constraints. If the discovery doc uses an older format, map equivalent sections such as requirements, UI/UX specs, and technical considerations. Proceed to GATE 1.
   - **If NOT found:** offer the user a choice via AskUserQuestion:
     - **Run /nf first** (recommended) — full discovery interview for complex features
     - **Quick prototype** — describe the feature briefly, create an exploratory mockup

3. **Quick prototype mode** (if user chose it):
   - Ask 3-5 targeted questions via AskUserQuestion:
     - What is the feature in one sentence?
     - What are the key screens or components? (UI) / What are the main services and entities? (Backend)
     - What's the primary user flow or data flow?
     - Any specific constraints or must-haves?
   - Label the output as an "Exploratory Prototype" (not yet validated by discovery)
   - Skip directly to GATE 2 after collecting answers

---

## GATE 1: Task Type Detection

Read the discovery document holistically. The question is not "which keywords appear more" — it's **"what does the user need to validate visually?"**

**UI_FACING** — the user needs to see how the feature *looks and feels*:
- Screens, layouts, interactions, navigation flows
- The discovery doc has a substantive "How It Works" section or equivalent UI/UX flow description
- The value of the prototype is seeing the visual design

**BACKEND** — the user needs to see how the feature *is structured*:
- Services, data flow, API contracts, entity relationships
- The discovery doc focuses on technical architecture and DDD layers
- The value of the prototype is understanding the system design

**MIXED** — both UI and architecture are significant:
- Offer to create both, or ask which the user wants to validate first

Confirm the detected type with the user via AskUserQuestion before proceeding.

---

## GATE 2: Playground Generation

**Invoke the `playground` skill** with the appropriate template.

- **UI-facing tasks:** read `references/ui-playground-template.md` for the full prompt template
- **Backend tasks:** read `references/backend-playground-template.md` for the full prompt template

**For UI tasks, pass project-specific visual context to the playground when available:**
- Design system or component library name
- Theme tokens, CSS variables, Tailwind config, or style guide paths
- Existing screens or components that the prototype should visually align with
- Brand cues or visual tone

If no project-specific design context exists, instruct the playground to use a neutral, accessible default style that is easy to adapt.

**Fallback:** if the `playground` skill is not available, generate the HTML file directly:
- Self-contained single file (inline CSS/JS, no external deps)
- Dark theme, single state object pattern, live preview updates
- Include a "Copy Prompt" button for implementation notes

**After playground is created:**
```bash
open [TASK_DIRECTORY]/playground-[feature-name].html
```

---

## GATE 3: User Approval

Iterative approval loop — allows refinement without restarting.

1. **Present to user:** "Playground created and opened in browser. Please explore and provide your decision."

2. **Use AskUserQuestion with options:**
   - **Approve** — ready for technical decomposition
   - **Request Changes** — specify modifications (stays in /vp loop)
   - **Reject** — needs significant discovery rework

3. **Handle each decision:**

   **APPROVED:** capture any final notes, proceed to GATE 4.

   **CHANGES_REQUESTED:**
   - Capture specific change requests
   - Re-invoke playground skill with modifications
   - Regenerate playground file
   - Return to step 1 (loop until approved or rejected)

   **REJECTED:**
   - Capture rejection reason
   - Write rejection to `vp-approval.md` (see GATE 4 format)
   - Advise: "Discovery needs refinement. Consider running `/nf` again with additional context."
   - **STOP**

---

## GATE 4: Documentation Update

Write approval status to a **separate sidecar file** (keeps the discovery doc clean):

**File:** `[TASK_DIR]/vp-approval.md`

```markdown
# Visual Prototype Approval

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED
**Date**: [TODAY]
**Prototype**: `playground-[feature-name].html`
**Iteration**: [number of revision cycles]

## User Feedback
[Captured feedback from approval loop]

## Key Decisions Confirmed
- [Decisions validated during prototype review]

## Notes for Technical Decomposition
[Clarifications discovered during prototype review]
```

**Notify user:**
```
Visual prototype approved!

- Playground: playground-[feature-name].html
- Approval recorded: vp-approval.md
- Ready for /ct to proceed with technical decomposition
```

---

## Output

**Files created:**
- `tasks/task-YYYY-MM-DD-[feature-name]/playground-[feature-name].html` (new)
- `tasks/task-YYYY-MM-DD-[feature-name]/vp-approval.md` (new)

**Next step:** run `/ct` to create technical decomposition based on the approved visual prototype.

---

## Reference Files

Read these as needed — they contain prompt templates and detailed guidance:

| File | When to read |
|------|-------------|
| `references/ui-playground-template.md` | Generating a UI-facing playground |
| `references/backend-playground-template.md` | Generating a backend architecture playground |
| `references/tips.md` | Before generating any playground (quality tips) |

## Handoff — Next Steps

After visual prototype is approved, present to the user:

```
Visual prototype approved for [feature-name]:
- Playground: tasks/task-YYYY-MM-DD-[feature-name]/playground-[feature-name].html
- Approval: tasks/task-YYYY-MM-DD-[feature-name]/vp-approval.md

Next steps:
→ Create tech plan: /ct [feature-name]
```

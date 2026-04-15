# Plan Review - [Task Title]

**Date**: YYYY-MM-DD | **Reviewer**: `plan-reviewer`
**Task Directory**: [absolute path]
**Reviewed Document**: `tech-decomposition-[feature].md`
**Status**: ✅ APPROVED / ⚠️ NEEDS UPDATES / ❌ BLOCKED

---

## Inputs Reviewed
- Technical decomposition: `path/to/tech-decomposition-[feature].md`
- Supporting docs: [paths reviewed, or `None reviewed`]
- Code / architecture references: [paths reviewed, or `None reviewed`]

---

## Summary
[2-4 sentences summarizing implementation readiness and the highest-impact gaps.]

---

## Reality Check

| Check | Status | Notes |
|---|---|---|
| Real user or system value | ✅ / ⚠️ / ❌ | [Does this plan deliver working behavior, not just scaffolding?] |
| Functional depth | ✅ / ⚠️ / ❌ | [Are the steps deep enough to produce usable functionality?] |
| End-to-end completeness | ✅ / ⚠️ / ❌ | [Are the core flows, data handling, and failure paths covered?] |

---

## Implementation Readiness

| Area | Status | Notes |
|---|---|---|
| Step decomposition | ✅ / ⚠️ / ❌ | [Atomic, actionable, and reviewable] |
| Sequencing and dependencies | ✅ / ⚠️ / ❌ | [No circular or forward-assumed contracts] |
| File / module specificity | ✅ / ⚠️ / ❌ | [Concrete paths, modules, and boundaries] |
| Codebase fit and reuse | ✅ / ⚠️ / ❌ | [Matches existing patterns and abstractions] |
| Risks / blockers | ✅ / ⚠️ / ❌ | [Important uncertainties or prerequisite work] |

---

## Testing Review

| Area | Status | Notes |
|---|---|---|
| Requirement coverage | ✅ / ⚠️ / ❌ | [Do tests map to required behavior?] |
| Functional validation | ✅ / ⚠️ / ❌ | [Do tests prove real user or system outcomes?] |
| Edge cases and failures | ✅ / ⚠️ / ❌ | [Errors, empty states, and boundary cases] |
| Verification commands | ✅ / ⚠️ / ❌ | [Concrete commands or verification steps] |

---

## Findings

### Critical Issues
- [ ] [Issue] -> [Impact] -> [Required change]

### Major Issues
- [ ] [Issue] -> [Impact] -> [Recommended change]

### Minor Improvements
- [ ] [Suggestion] -> [Benefit]

### Clarifications Needed
- [ ] [Question] -> [Why it matters]

If a section has no items, write `None.`

---

## Decision
**Verdict**: ✅ APPROVED / ⚠️ NEEDS UPDATES / ❌ BLOCKED  
**Rationale**: [Why this status is appropriate]  
**Ready for `/si`**: [Yes / After updates / No]

---

## Revision Checklist
- [ ] [Concrete fix 1]
- [ ] [Concrete fix 2]

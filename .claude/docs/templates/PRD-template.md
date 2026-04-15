# PRD: [Feature Name]

**Created**: YYYY-MM-DD
**Status**: Draft | In Review | Approved
**JTBD Reference**: [Link to JTBD document] · **Version**: v0.1

---

## Problem & Evidence

**Problem**: [What pain exists? Who feels it? In what context?]

**Evidence** — prove the problem is real, not assumed
- [User quote, support ticket, data point, or research finding]
- [...]
- [...]

**Business Impact**: [Why solving this job matters for the company — connect to metrics or strategy]

---

## Non-Goals

> Write this BEFORE goals. What you cut matters more than what you include.

- [What we are NOT building in this version]
- [Adjacent feature explicitly excluded]
- [Scope boundary that could accidentally expand]

---

## Goals & Metrics

**Goals**
- [Goal 1 — measurable, aligned to JTBD success criteria]
- [Goal 2]

**Success Metrics** — each metric needs: number + timeframe + measurement method

| Metric | Target | Timeframe | How Measured |
|--------|--------|-----------|--------------|
| [e.g., Task completion rate] | [e.g., >85%] | [e.g., 30 days post-launch] | [e.g., Analytics event tracking] |
| [...] | [...] | [...] | [...] |

**Guardrails** — metrics that must NOT degrade
- [e.g., Page load time stays <800ms]
- [...]

---

## User Stories & Requirements

**User Stories**
- *As a* [persona], *I need* [capability], *so I can* [benefit]. **Done when** [acceptance criteria].
- *As a* [...], *I need* [...], *so I can* [...]. **Done when** [...]
- [...]

**Requirements**

| Priority | Requirement | Acceptance Criteria |
|----------|------------|---------------------|
| **P0** (must-have) | [Requirement] | [How to verify it works] |
| **P0** | [...] | [...] |
| **P1** (should-have) | [...] | [...] |
| **P2** (nice-to-have) | [...] | [...] |

**Non-Functional Requirements**

| Category | Target |
|----------|--------|
| Performance | [e.g., API responses <200ms p95, page load <800ms on 3G] |
| Security | [e.g., Auth required, data encrypted at rest, OWASP compliance] |
| Accessibility | [e.g., WCAG 2.1 AA] |
| Scalability | [e.g., Support 10K concurrent users] |

---

## Solution Outline

**Core Flow**
1. [User action] → [System response]
2. [...] → [...]
3. [...] → [...]

**Key States**: loading | empty | error | success | [variants]

**Rules & Constraints**
- [Business rule 1]
- [Policy, compliance, or data constraint]

**Experience Notes**
- [Design principles, responsive requirements, accessibility notes]

---

## Research Findings

> This section is **mandatory**. Writing requirements based on assumptions instead of research is the #1 PRD anti-pattern.

**How Similar Products Solve This**
- [Product 1]: [Approach, what works, what doesn't — with source]
- [Product 2]: [...]

**Competitive Landscape**
- [Key differentiator or gap identified]

**Technical Approach Research**
- [Relevant pattern, library, or architecture insight — informed, not prescriptive]
- [Source]

---

## Shipping & Risks

| Item | Details |
|------|---------|
| **Dependencies** | [Teams, APIs, services, research needed] |
| **Risks** | [Risk → Mitigation plan] |
| **Assumptions** | [Assumption → How to validate → Risk if wrong] |

**Open Questions**
- [ ] [Question 1]
- [ ] [Question 2]

---

### PRD Lite (single-page version)

1. **Problem**: [One sentence + evidence]
2. **Non-Goals**: [Top 2-3 exclusions]
3. **Success Metric**: [One KPI — number + timeframe + method]
4. **Key Story**: [As a..., I need..., so I can... Done when...]
5. **Launch Checklist**:
   - [ ] Dependencies aligned
   - [ ] Risks owned
   - [ ] Open questions resolved

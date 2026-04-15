# Technical Decomposition: Phase 2 - Sport Page

**Status**: Ready for Implementation | **Created**: 2026-03-31
**Parent Task**: _See parent splitting-decision.md_

---

## Tracking & Progress

### Linear Issue
- **ID**: WYT-198
- **URL**: https://linear.app/alexandrbasis/issue/WYT-198/phase-2-sport-page
- **Status**: Ready for Implementation

### PR Details
- **Branch**: feature/wyt-198-phase-2-sport-page
- **PR URL**: [Added during implementation]
- **Status**: [Draft/Review/Merged]

---

## Primary Objective

Create the Sport page at `/sport` with weekly stats bar (sessions, duration, streak), day-grouped activity list with rest day toggles, week navigation, an empty state for new users, and a trackable type selector in the creation flow -- delivering the use case "user can view and navigate their sport activities on a dedicated page."

---

## Must Haves

- [ ] Sport page at `/sport` displays week-scoped stats bar (sessions, duration, streak), day-grouped activity list, and rest day toggles
- [ ] Stats bar duration sums ALL `TIME_ELAPSED` fields across all sport entries in the selected week
- [ ] Streak calculation correctly handles active days, rest days (preserve not increment), and "today pending" logic
- [ ] Week navigation allows browsing previous/next weeks with "Mar 24 -- Mar 30" format
- [ ] Sport nav item appears in sidebar and mobile bottom bar (6 items total)
- [ ] Sport trackable creation from Sport page pre-selects `trackableType: 'sport'`
- [ ] Empty state shown when no sport trackables exist with CTA to create one
- [ ] All existing tests continue to pass

---

## Implementation Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 2 | Duration format in stats | Always `Xh Ym` (e.g., `0h 45m`) | Consistent format, no conditional logic needed |
| 3 | Week start source | Use existing `weekStart` store | Consistent with rest of app; already user-configurable |
| 4 | Sport stats computation layer | View-layer only (no Variables) | Avoids dual-math complexity; keeps MVP scope tight |

---

## Dependencies

### Phase Dependencies
- **Requires**: Phase 1 merged (needs trackable type flag, RestDay entity, sport filtering, streak/stats services)
- **Blocks**: Phase 3

### Technical Dependencies
- Phase 1 entities: `TrackableType`, `RestDay`, `RestDayService`, `RestDayStore`
- Phase 1 services: `SportStreakService`, `SportStatsService`
- Phase 1 stores: `getSportTrackables()`, `getSportEntries()`
- Existing: `weekStart` store from `stores/ui/weekStart.ts`
- Existing: `FormModal` component for quick entry creation

---

## Test Plan (TDD - Define First)

### Test Strategy
Phase 2 is primarily UI components (Svelte). The testable domain logic (streak and stats services) was implemented in Phase 1. Component-level integration tests verify that the Sport page correctly wires the services and stores together. The creation flow type selector is tested through validation tests that were established in Phase 1.

**Test commands**: `npm run test` (from `client/` directory)

### Test Cases to Implement

No new formal test suites are required for this phase. The streak (TP-1), stats (TP-3), and edge case (TP-7.5) tests were implemented in Phase 1 since they test the services directly. The UI components consume these services but are verified through manual testing and the existing test infrastructure.

**Manual verification checklist** (not automated tests, but required for PR acceptance):
- Sport page renders at `/sport` without errors
- Stats bar shows correct sessions, duration, streak for current week
- Week navigation changes displayed data correctly
- Day-grouped list shows sport entries under correct date headers
- Rest day toggle creates/removes rest day records
- Empty state appears when no sport trackables exist
- FAB opens trackable creation with `trackableType: 'sport'` pre-selected
- Sport nav item visible in sidebar and mobile bottom bar
- Type selector in creation flow shows Regular/Sport options
- Selecting Sport type enforces TIME_ELAPSED validation (from Phase 1)

### Coverage Requirements
- Minimum 90% code coverage for new non-Svelte code
- All use cases covered by tests or manual verification
- Svelte components follow existing patterns for testability

---

## Implementation Steps & Changelog

### Step 1: Create Sport page components -- **Wave 1** [REQ-PAGE] [REQ-STATS] [REQ-LIST] [REQ-WEEKNAV]

**Files** (all NEW):
- `client/src/views/sport/SportView.svelte` -- main page container
- `client/src/components/sport/SportStatsBar.svelte` -- 3-stat bar (sessions, duration, streak)
- `client/src/components/sport/SportWeekNav.svelte` -- week navigation with arrows
- `client/src/components/sport/SportActivityList.svelte` -- day-grouped entry list
- `client/src/components/sport/SportActivityRow.svelte` -- single entry row (icon, name, duration, time)
- `client/src/components/sport/RestDayToggle.svelte` -- per-day rest day toggle
- `client/src/components/sport/SportEmptyState.svelte` -- "Get Started" card for no sport trackables

**SportView structure** (follows GoalView pattern):
```
MobileTopBar
SportWeekNav  <- uses $weekStart store from stores/ui/weekStart.ts for week boundaries
SportStatsBar
{#if hasSportTrackables}
  SportActivityList
    {#each dayGroups as day}
      DayHeader
      {#each day.entries as entry}
        SportActivityRow (expandable)
      {/each}
      RestDayToggle
    {/each}
{:else}
  SportEmptyState
{/if}
FAB (opens trackable creation with type='sport')
```

**State**: Selected week is local `$state` in SportView (not a global store). Import `$weekStart` from `stores/ui/weekStart.ts` to determine Mon-start vs Sun-start week boundaries.

**Layout details from VP approval**:
- Activity row: 36px rounded icon | name + meta | duration + time (right-aligned)
- Stats bar: 3 metrics with icons (sessions, duration, streak) scoped to week
- Week nav: "Mar 24 -- Mar 30" format with chevron arrows
- Rest day toggle: inline per-day with blue highlight when active
- Empty state: centered card with CTA pre-setting `trackableType: 'sport'`

**Changelog**: Create Sport page with stats bar, week navigation, activity list, rest day toggles, and empty state

---

### Step 2: Add Sport route and navigation -- **Wave 1** [REQ-NAV] [REQ-ROUTE]

**Files**:
- `client/src/App.svelte` -- add `{ path: "/sport", component: SportView }` to routes array
- `client/src/model/ui/sidebar.ts` -- add `{ icon: faDumbbell, path: "/sport", title: "Sport" }` to `SIDEBAR_LINKS` after Trackables, before Journal. Do NOT set `showOnMobile: false` -- Sport must appear in mobile bottom bar (6 items total).

**Changelog**: Add /sport route and Sport nav item (sidebar + bottom bar)

---

### Step 3: Add trackable type selector to creation flow -- **Wave 1** [REQ-CREATE]

**Files**:
- `client/src/views/trackable/EditTrackableView.svelte` or the trackable creation component
- `client/src/components/trackable/` -- wherever the creation wizard lives

**Changes**:
- Add a "Trackable Type" selector at the top of creation form: Regular (default) | Sport
- When Sport selected: set `trackableType: 'sport'` on the trackable being created
- Show validation error if saving sport trackable without TIME_ELAPSED field
- When navigating from Sport page "Add" button: pre-select Sport type

**Changelog**: Add trackable type selector (Regular/Sport) to creation flow with TIME_ELAPSED validation

---

## Wave Summary (Phase-relative)

| Wave | Steps | Description | Parallelizable |
|------|-------|-------------|----------------|
| **1** | 1, 2, 3 | Sport page + route + creation flow | Partially (1,2,3 can be parallel) |

---

## Success Criteria
- [ ] All tests passing (existing + Phase 1 tests)
- [ ] Coverage >= 90% for new non-Svelte code
- [ ] Lint/Format/Type-check passing
- [ ] Code review approved
- [ ] Merged to main

---

## Notes
- The Sport page consumes `SportStreakService` and `SportStatsService` from Phase 1 -- these are pure-function services that take data as arguments. The page is responsible for gathering the inputs (sport entries, rest days, trackables, forms) and passing them to the services.
- The streak pseudocode from discovery Section 7 was implemented in Phase 1's `SportStreakService`. The Sport page just calls `calculateStreak()` and displays the result.
- The `weekStart` store already exists at `stores/ui/weekStart.ts` -- do NOT create a new one. SportView uses it to determine week boundaries.
- Follow the `GoalView` pattern for page structure and the existing sidebar link patterns for navigation wiring.
- The 6-item bottom bar (mobile) was approved in the visual prototype at 375px width.

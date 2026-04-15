# Technical Decomposition: Phase 3 - Dashboard Widget

**Status**: Ready for Implementation | **Created**: 2026-03-31
**Parent Task**: _See parent splitting-decision.md_

---

## Tracking & Progress

### Linear Issue
- **ID**: WYT-199
- **URL**: https://linear.app/alexandrbasis/issue/WYT-199/phase-3-sport-dashboard-widget
- **Status**: Ready for Implementation

### PR Details
- **Branch**: feature/wyt-199-phase-3-dashboard-widget
- **PR URL**: [Added during implementation]
- **Status**: [Draft/Review/Merged]

---

## Primary Objective

Create a `SPORT_SUMMARY` dashboard widget that displays weekly sport stats (sessions, duration, streak) with a quick-log dropdown for adding sport entries directly from the dashboard -- delivering the use case "user can see sport summary on dashboard and quick-log activities without navigating to the Sport page."

---

## Must Haves

- [ ] `SPORT_SUMMARY` widget type is registered in `DashboardWidgetType` enum
- [ ] Widget definition exists with correct default dimensions (3x1) and minimum dimensions (2x1)
- [ ] Widget displays weekly stats (sessions, duration, streak) matching Sport page values
- [ ] Quick-log [+] dropdown lists sport trackables by icon + name
- [ ] Tapping a trackable in quick-log opens FormModal for that trackable
- [ ] Widget settings editor allows editing widget name (default: "Sport This Week")
- [ ] Widget is registered in BOTH `RENDERERS` maps (display + edit sidebar)
- [ ] `createDependencies()` returns `new Map()` (stats bypass Variable system)
- [ ] All existing tests continue to pass

---

## Implementation Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 2 | Duration format in stats | Always `Xh Ym` (e.g., `0h 45m`) | Consistent format, no conditional logic needed |
| 4 | Sport stats computation layer | View-layer only (no Variables) | Avoids dual-math complexity; widget computes stats the same way as the Sport page |

---

## Dependencies

### Phase Dependencies
- **Requires**: Phase 1 merged (needs sport stores/services), Phase 2 merged (needs streak/stats services used by Sport page -- ensures consistent behavior)
- **Blocks**: None (last phase)

### Technical Dependencies
- Phase 1 entities: `TrackableType`, `RestDay`, `RestDayStore`
- Phase 1 services: `SportStreakService`, `SportStatsService`
- Phase 1 stores: `getSportTrackables()`, `getSportEntries()`
- Existing: `DashboardWidgetType` enum, `DashboardWidgetDefinition` base class
- Existing: `RENDERERS` maps in `DashboardWidgetRenderer.svelte` and `EditWidgetSidebar.svelte`
- Existing: `FormModal` component for quick-log entry creation

---

## Test Plan (TDD - Define First)

### Test Strategy
Widget tests verify the definition registration and that stats computation matches the Sport page. The `DashboardSportSummaryWidgetDefinition` class is testable as a unit (it's a plain class with methods). Quick-log behavior is tested through manual verification.

**Test commands**: `npm run test` (from `client/` directory)

### Test Cases to Implement

#### TP-8: Dashboard Widget [REQ-WIDGET] -- `client/tests/sport/widget.test.ts`

**TP-8.1: SPORT_SUMMARY widget type is registered**
- **Given** dashboard widget definitions
- **When** looking up SPORT_SUMMARY
- **Then** definition exists with correct default dimensions (3x1) and settings

**TP-8.2: Widget stats match Sport page stats**
- **Given** same sport entries and rest days
- **When** widget stats and page stats are computed
- **Then** sessions, duration, and streak values are identical

### Coverage Requirements
- Minimum 90% code coverage for new non-Svelte code
- Widget definition class fully covered
- Stats consistency verified

---

## Implementation Steps & Changelog

### Step 1: Create `SPORT_SUMMARY` dashboard widget -- **Wave 1** [REQ-WIDGET]

**Files** (following existing widget pattern -- note: TWO RENDERERS maps exist):
- `client/src/model/dashboard/widgets/sportSummary.ts` (NEW) -- settings type + definition class
  - `DashboardSportSummaryWidgetDefinition.createDependencies()` returns `new Map()` (stats bypass Variable system)
- `client/src/model/dashboard/dashboard.ts` -- add `SPORT_SUMMARY` to `DashboardWidgetType` enum, add to settings union, add to `definitions` map
- `client/src/components/dashboard/types/sportSummary/DashboardSportSummaryWidget.svelte` (NEW) -- widget display renderer
- `client/src/components/dashboard/sidebar/edit/types/sportSummary/EditSportSummaryWidgetSidebar.svelte` (NEW) -- widget settings editor
- `client/src/components/sport/SportQuickLog.svelte` (NEW) -- quick-log dropdown
- `client/src/components/dashboard/DashboardWidgetRenderer.svelte` -- add to display `RENDERERS` map
- `client/src/components/dashboard/sidebar/edit/EditWidgetSidebar.svelte` -- add to edit `RENDERERS` map

**Widget definition** (`DashboardSportSummaryWidgetDefinition`):
- Min size via `getMinWidth()`/`getMinHeight()`: 2x1 grid units
- Default size at creation time: w=3, h=1 (set in `createDefaultWidget()` method, not via min getters)
- Settings: `{ name: string }` (default: "Sport This Week")
- `createDependencies()` returns `new Map()` -- no Variable dependencies
- Quick-log [+]: dropdown listing sport trackables by icon + name, tapping opens FormModal

**CRITICAL: Two RENDERERS maps must be updated**:
1. `client/src/components/dashboard/DashboardWidgetRenderer.svelte` -- display renderer map (renders the widget on the dashboard)
2. `client/src/components/dashboard/sidebar/edit/EditWidgetSidebar.svelte` -- edit sidebar renderer map (renders the settings editor in the sidebar)

Missing either registration will cause the widget to silently fail to render or have no settings UI.

**Changelog**: Create SPORT_SUMMARY dashboard widget with stats display, settings editor, and quick-log dropdown

---

### Step 2 (Tests): Write widget tests -- **Wave 1** [REQ-WIDGET]

**Files**:
- `client/tests/sport/widget.test.ts` (NEW) -- tests for TP-8

**Pattern**: Instantiate `DashboardSportSummaryWidgetDefinition`, verify `getMinWidth()`, `getMinHeight()`, `createDefaultWidget()` dimensions. For stats consistency test, call `SportStatsService.computeWeekStats()` with the same inputs and verify the widget would display the same values.

**Changelog**: Add dashboard widget registration and stats consistency tests

---

## Wave Summary (Phase-relative)

| Wave | Steps | Description | Parallelizable |
|------|-------|-------------|----------------|
| **1** | 1, 2 | Widget implementation + tests | Partially (tests after definition class exists) |

---

## Success Criteria
- [ ] All tests passing (existing + Phase 1 + Phase 2 tests + new widget tests)
- [ ] Coverage >= 90% for new non-Svelte code
- [ ] Lint/Format/Type-check passing
- [ ] Code review approved
- [ ] Merged to main

---

## Notes
- **TWO RENDERERS maps**: This is the most common gotcha for dashboard widgets. The display renderer (`DashboardWidgetRenderer.svelte`) and the edit sidebar renderer (`EditWidgetSidebar.svelte`) are separate maps. Both must have the `SPORT_SUMMARY` entry or the widget will silently fail.
- The widget computes stats the same way as the Sport page -- by calling `SportStatsService.computeWeekStats()` directly. This ensures consistency (TP-8.2).
- `createDependencies()` returning `new Map()` is intentional -- sport stats bypass the Variable system per implementation decision #4.
- Quick-log dropdown reuses the `FormModal` component that already exists for journal entry creation. The dropdown just provides a sport-trackable-filtered list of options.
- Follow the existing widget pattern closely -- study a similar widget (e.g., the existing goal or chart widget) for the file structure and registration pattern.

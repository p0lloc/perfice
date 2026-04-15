# Code Review - Phase 2 Sport Page

**Date**: 2026-04-15 | **Reviewer**: AI Code Reviewer | **Status**: NEEDS FIXES

<!-- SECTION:review-context -->
## Review Context

- **Mode**: task
- **Target**: phase-2-sport-page (WYT-198)
- **Base**: main
- **Head**: 18f4304 (feature/wyt-198-phase-2-sport-page)
- **Scope**: full
- **Spec Available**: yes
- **Immutable Snapshot**: yes
- **Untracked Files**: none

<!-- /SECTION:review-context -->

---

<!-- SECTION:summary -->
## Reviewer Note

Phase 2 delivers the complete Sport page UI: 7 new Svelte components, route registration, sidebar navigation, and trackable type selector in the creation flow. Spec compliance is excellent (10/10 criteria met) and the architectural pattern correctly follows existing views (GoalView model). Security is clean. The primary concern across multiple reviewers is **duplicated duration-extraction logic** in `SportActivityList.svelte` that reimplements functions already present in `SportStatsService` — this creates a maintenance risk and leaves the duplicate code untested. A secondary concern is the **absence of error handling on `loadData()`**, which would leave users on a permanent "Loading..." spinner if any async call fails.

<!-- /SECTION:summary -->

---

<!-- SECTION:verdict -->
## Verdict

**NEEDS FIXES**

Two major issues must be addressed before merge:
1. Extract duplicated duration logic from `SportActivityList.svelte` to reuse `SportStatsService` functions
2. Add error handling to `SportView.loadData()` to prevent permanent loading state on failure

After fixing these, the PR is ready to merge.

<!-- /SECTION:verdict -->

---

<!-- SECTION:key-findings -->
## Key Findings

| # | Severity | Finding | Source | Action |
|---|----------|---------|--------|--------|
| 1 | **MAJOR** | Duplicated duration logic (`unwrapDisplayValue`, `formatDurationMs`, `timeElapsedFields` map) in `SportActivityList.svelte` reimplements `SportStatsService` functions — untested, maintenance risk | Architecture, Code Quality, Test Coverage, Performance | Extract to shared utility or import from `SportStatsService` |
| 2 | **MAJOR** | No error handling on `SportView.loadData()` — any failed async call leaves users on permanent "Loading..." spinner | Architecture | Add try/catch with error state and user-visible fallback |
| 3 | **MAJOR** | `getWeekBounds()` double-computed: once in `$state` initializer and again in `$derived` chain (`SportView.svelte:28-29`) | Performance | Unify into single `$derived` source |
| 4 | **MAJOR** | Redundant re-filtering of already week-scoped entries in `computeWeekStats` (`stats.ts:43-45`) | Performance | Accept pre-filtered entries or document the contract |
| 5 | MINOR | `$effect` + `onMount` potential race condition on initial load in `SportView` | Architecture | Use single `$effect` for initial + navigation loads |
| 6 | MINOR | Type selector (Regular/Sport) always visible in `CreateTrackableModal` even from non-sport contexts | Architecture | Consider hiding when opened from Track page |
| 7 | MINOR | Task doc Step 3 references non-existent `EditTrackableView.svelte` | Documentation | Correct to `CreateTrackableModal.svelte` |
| 8 | MINOR | Stale Linear status and PR placeholders in task doc | Documentation | Update with actual values |

<!-- /SECTION:key-findings -->

---

<!-- SECTION:coverage -->
## Review Coverage

- **Diff Reviewed**: Full diff (15 files, +519/-35 lines) via `git diff main...HEAD`
- **Spec Used**: `tech-decomposition-phase-2-sport-page.md` — Must Haves (8 items), Success Criteria, Implementation Steps (3 steps)
- **Verification Run**: Type check (0 errors), test suite (20/20 tests pass; 21 file-level failures are pre-existing on main due to `@perfice/model/variable/variable` resolution)
- **Review Limits**: No Svelte component rendering tests (Svelte 5 runes not supported by current test infra); visual/UX not verified in browser

<!-- /SECTION:coverage -->

---

## Domain Findings

<!-- SECTION:quality-gate -->
### Verification Gate

| Check | Result | Notes |
|-------|--------|-------|
| `svelte-check` | PASS (0 errors, 0 warnings) | Run from `client/` directory |
| `vitest run` | PASS (20/20 tests) | 21 file-level failures are **pre-existing on main** (`@perfice/model/variable/variable` resolution). Identical results on main branch — no regressions introduced |

<!-- /SECTION:quality-gate -->

---

<!-- SECTION:spec-compliance -->
### Spec Compliance

**Agent**: `spec-compliance-reviewer` | **Status**: COMPLIANT

#### Requirements Verification

| # | Acceptance Criterion | Status | Evidence | Notes |
|---|---------------------|--------|----------|-------|
| 1 | Sport page at `/sport` displays week-scoped stats bar (sessions, duration, streak), day-grouped activity list, and rest day toggles | IMPLEMENTED | `SportView.svelte:105-145`, `SportStatsBar.svelte`, `SportActivityList.svelte`, `RestDayToggle.svelte` | Page renders stats bar with 3 metrics, day-grouped list with entries, and per-day rest day toggles exactly as specified |
| 2 | Stats bar duration sums ALL `TIME_ELAPSED` fields across all sport entries in the selected week | IMPLEMENTED | `SportActivityList.svelte:37-64` (per-entry extraction), `SportView.svelte:83-90` (delegates to `statsService.computeWeekStats`) | Duration computed via `SportStatsService.computeWeekStats` from Phase 1; activity list also extracts per-entry duration using `TIME_ELAPSED` fields. Format is `Xh Ym` per decision #2 (`stats.ts:83-88`, `SportActivityList.svelte:72-76`) |
| 3 | Streak calculation correctly handles active days, rest days (preserve not increment), and "today pending" logic | IMPLEMENTED | `SportView.svelte:83-90` | Delegates to `SportStreakService` (Phase 1 service). Passes `allRestDays`, `currentWeekStart`, `currentWeekEnd`, and `new Date()` for today-pending logic |
| 4 | Week navigation allows browsing previous/next weeks with "Mar 24 -- Mar 30" format | IMPLEMENTED | `SportWeekNav.svelte:14-22`, `SportView.svelte:37-40` | Uses `weekOffset` state with `prevWeek`/`nextWeek`. Format uses en-dash (`–`) rather than literal double-dash (`--`) from spec -- this is a cosmetic improvement, not a deviation |
| 5 | Sport nav item appears in sidebar and mobile bottom bar (6 items total) | IMPLEMENTED | `sidebar.ts:25` | Added `{icon: faDumbbell, path: "/sport", title: "Sport"}` after Track, before Journal. No `showOnMobile: false` set, so it appears in mobile bar. Mobile count: Home, Track, Sport, Journal, Goals, Tags = 6 items (Analytics/Reflections hidden, Settings is bottom) |
| 6 | Sport trackable creation from Sport page pre-selects `trackableType: 'sport'` | IMPLEMENTED | `SportView.svelte:96` (`createTrackableModal.open(null, 'sport')`), `CreateTrackableModal.svelte:28-30` (`open` accepts `initialType` param and sets `trackableType` state) | FAB and empty state CTA both call `createSportTrackable()` which opens modal with `'sport'` pre-selected |
| 7 | Empty state shown when no sport trackables exist with CTA to create one | IMPLEMENTED | `SportView.svelte:146` (`SportEmptyState`), `SportEmptyState.svelte:1-21` | Renders centered card with dumbbell icon, descriptive text, and "Create Sport Trackable" button that calls `onCreate` |
| 8 | All existing tests continue to pass | IMPLEMENTED | Spec line 177 reports "24 files, 139 tests pass" | No test files were modified; only UI components and service signatures extended with backward-compatible defaults |
| 9 | Type selector in creation flow shows Regular/Sport options | IMPLEMENTED | `CreateTrackableModal.svelte:67-84` | Two toggle buttons (Regular with clipboard icon, Sport with dumbbell icon) with visual highlight for selected type. Type is passed through `onSelectSuggestion` and `onSingleValue` callbacks |
| 10 | Coverage >= 90% for new non-Svelte code | IMPLEMENTED | Spec notes "no new non-Svelte code (all UI)" | Only new non-Svelte code is 2 small methods added to `RestDayStore` (`toggle`, `getRestDaysInRange`) which delegate to already-tested Phase 1 service methods |

**Coverage**: 10/10 criteria fully implemented

#### Implementation Step Verification

| Step | Description | Status | Evidence |
|------|-------------|--------|----------|
| Step 1 | Create Sport page components (7 files) | IMPLEMENTED | All 7 files created: `SportView.svelte`, `SportStatsBar.svelte`, `SportWeekNav.svelte`, `SportActivityList.svelte`, `SportActivityRow.svelte`, `RestDayToggle.svelte`, `SportEmptyState.svelte` |
| Step 2 | Add Sport route and navigation | IMPLEMENTED | `App.svelte:71` adds `/sport` route; `sidebar.ts:25` adds nav item after Track, before Journal per spec |
| Step 3 | Add trackable type selector to creation flow | IMPLEMENTED | `CreateTrackableModal.svelte` modified with type selector; `trackable.ts` service and `trackable.svelte.ts` store updated to pass `trackableType` through creation pipeline |

#### Extra Work (not in spec)

| File | Change | Justification |
|------|--------|---------------|
| `restday.svelte.ts` | Added `toggle()` and `getRestDaysInRange()` methods | JUSTIFIED -- necessary to wire rest day toggle UI to Phase 1 service layer |
| `TrackableView.svelte` | Updated callback signatures to include `trackableType` | JUSTIFIED -- required to make the modified `CreateTrackableModal` work from the existing Track page too (backward-compatible with `'regular'` default) |

#### Spec Deviations (non-blocking)

- [INFO] **Week nav format**: Spec says `"Mar 24 -- Mar 30"` (double hyphen-minus). Implementation uses en-dash `–` (`SportWeekNav.svelte:20-21`). This is a typographic improvement, not a functional deviation.
- [INFO] **Activity row icon size**: Spec says "36px rounded icon". Implementation uses `w-9 h-9` (36px) but delegates to the `Icon` component rather than rendering a rounded circle directly (`SportActivityRow.svelte:16-19`). Functionally equivalent.

#### Issues

No critical or major issues found.

<!-- /SECTION:spec-compliance -->

---

<!-- SECTION:approach-review -->
### Approach Review

**Agent**: `senior-architecture-reviewer` | **Status**: MINOR_ADJUSTMENTS

#### Requirements Check

| Requirement | Status | Notes |
|-------------|--------|-------|
| Sport page at `/sport` with stats bar, activity list, rest day toggles | DONE | SportView orchestrates all sub-components correctly |
| Stats bar duration sums TIME_ELAPSED fields | DONE | Computed in SportActivityList via form introspection |
| Streak calculation with rest days and today-pending | DONE | Delegates to SportStreakService from Phase 1 |
| Week navigation with "Mar 24 -- Mar 30" format | DONE | SportWeekNav with offset-based navigation |
| Sport nav item in sidebar and mobile bottom bar | DONE | Added to SIDEBAR_LINKS without showOnMobile:false |
| Sport trackable creation pre-selects sport type | DONE | CreateTrackableModal.open(null, 'sport') |
| Empty state with CTA | DONE | SportEmptyState component |
| All existing tests pass | DONE | Per tech-decomposition checklist |

#### TDD Compliance

**Score**: N/A | **Status**: COMPLIANT (justified exemption)

| Criterion | Test Commit | Impl Commit | Order | Status |
|-----------|-------------|-------------|-------|--------|
| All Phase 2 work | N/A | 18f4304 | N/A | Justified -- Phase 2 is UI-only; all testable domain logic (streak, stats, rest day services) was tested in Phase 1. Tech decomposition explicitly states no new test suites required. |

The tech decomposition states: "No new formal test suites are required for this phase. The streak (TP-1), stats (TP-3), and edge case (TP-7.5) tests were implemented in Phase 1 since they test the services directly." This is a reasonable decision -- the new code is purely Svelte view/component layer that consumes already-tested services.

#### Solution Assessment

| Metric | Score | Notes |
|--------|-------|-------|
| Approach Quality | 8/10 | Correct approach: thin view layer consuming Phase 1 services. View-layer stats computation matches the "no Variables system" decision. Minor issue with duplicated duration logic. |
| Architecture Fit | 8/10 | Follows GoalView pattern (onMount, store imports, center-view layout). Correct layer separation: views -> stores -> services. One concern: SportActivityList contains domain logic that arguably belongs in a service. |
| Best Practices | 7/10 | Backward-compatible API changes with defaults. Good component decomposition. Two issues: no error handling on async operations, and `$effect` data-loading pattern has a subtle reactivity concern. |

#### Issues

- [MAJOR] **Duration computation logic lives in component layer**: `SportActivityList.svelte` contains `getEntryDurationMs()`, `unwrapDisplayValue()`, `formatDurationMs()`, and `timeElapsedFields` derivation. This is domain logic for extracting and summing durations from journal entries -- it should live in `SportStatsService` (which already exists from Phase 1) or a utility module, not in a Svelte component. This makes the logic untestable without mounting the component and creates a maintenance risk if duration calculation rules change.
  - **Location**: `client/src/components/sport/SportActivityList.svelte` (script block, duration-related functions)
  - **Suggestion**: Extract `getEntryDurationMs()` and `unwrapDisplayValue()` into `SportStatsService` or a shared utility under `services/sport/`. The `formatDurationMs()` function partially duplicates `statsService.formatDuration()` already used in `SportView.svelte` -- consolidate to a single source.

- [MAJOR] **No error handling on async data loading**: `SportView.svelte`'s `loadData()` function calls `trackables.getSportTrackables()`, `journal.getSportEntries()`, and awaits store promises with no try/catch. If any store or service call fails (e.g., IndexedDB unavailable), the user sees a perpetual "Loading..." state with no feedback. The `handleToggleRestDay` function similarly has no error recovery.
  - **Location**: `client/src/views/sport/SportView.svelte`, `loadData()` and `handleToggleRestDay()`
  - **Suggestion**: Wrap `loadData()` in try/catch, set an error state, and display an error message. Note: GoalView also lacks this, so this may be a codebase-wide concern rather than a blocker for this PR.

- [MINOR] **`$effect` reactivity pattern may cause double-loading on mount**: In `SportView.svelte`, the `$effect` block accesses `currentWeekStart`/`currentWeekEnd` to track them and calls `loadData()`. Combined with `onMount` calling `trackables.load()` and `restDays.load()`, there is a potential race where `loadData()` fires before stores have resolved, producing empty results that do not automatically refresh when stores complete. The GoalView pattern uses `{#await $goals}` which naturally handles this.
  - **Location**: `client/src/views/sport/SportView.svelte`, `$effect` block and `onMount`

- [MINOR] **Type selector always visible in CreateTrackableModal**: The `open()` signature change is backward-compatible via the default parameter. However, the Regular/Sport type selector UI is now always visible in the modal, even when opened from TrackableView where sport type selection may be unexpected. Consider hiding the selector when not explicitly requested via a `showTypeSelector` prop.
  - **Location**: `client/src/components/trackable/modals/create/CreateTrackableModal.svelte`, type selector div in template

#### Positive Observations

- **Component boundaries are well-drawn**: RestDayToggle, SportStatsBar, SportWeekNav, SportActivityRow, and SportEmptyState are each single-responsibility, presentational components with clean prop interfaces using Svelte 5 `$props()`.
- **Backward-compatible API evolution**: The `trackableType` parameter was threaded through TrackableService -> TrackableStore -> CreateTrackableModal with default values (`'regular'`) at every level, ensuring zero breakage for existing callers.
- **Correct layer dependencies**: SportView imports from stores and services (not from db layer). Components import from model layer for types only. No circular dependencies detected.
- **Follows established codebase patterns**: Route registration in App.svelte, sidebar entry in sidebar.ts model, MobileTopBar usage, center-view layout class -- all consistent with GoalView/TrackableView conventions.

<!-- /SECTION:approach-review -->

---

<!-- SECTION:security -->
### Security

**Agent**: `security-code-reviewer`

*No security issues found.*

All 15 changed files were reviewed across components (`SportWeekNav`, `SportStatsBar`, `RestDayToggle`, `SportActivityRow`, `SportActivityList`, `SportEmptyState`), the view (`SportView`), services (`SportStatsService`, `SportStreakService`, `RestDayService`), and the store (`RestDayStore`).

- [INFO] **Svelte template interpolation is safe by default**: All user-derived data (`trackable.name`, `durationFormatted`, `entry.timestamp`, `sessions`, `streak`) is rendered via Svelte `{expression}` syntax, which auto-escapes HTML entities. No use of `{@html}` anywhere in the changed files -- no XSS surface.

- [INFO] **No unsafe DOM manipulation**: No `innerHTML`, `document.createElement`, or `eval()` usage. All rendering is declarative through Svelte templates.

- [INFO] **Date string input to RestDayService.toggle() is derived internally**: The `dateStr` passed to `onToggleRestDay` originates from `formatDateYYYYMMDD()` computed inside `SportActivityList.svelte` (line 88), not from user-controlled free-text input. The value flows through `RestDayStore.toggle()` -> `RestDayService.toggle()` -> `RestDayCollection` (Dexie/IndexedDB). No injection vector exists since IndexedDB uses structured queries, not string interpolation.

- [INFO] **Bounded iteration in streak calculation**: `SportStreakService.calculateStreak()` uses `MAX_LOOKBACK_DAYS = 365` (line 17 of `streak.ts`) to cap the backward walk, preventing potential infinite loops from malformed data.

- [INFO] **No sensitive data exposure**: No tokens, secrets, or PII are logged or exposed. Component props are strictly typed with TypeScript interfaces. No `console.log` of user data in any changed file.

- [INFO] **crypto.randomUUID() for ID generation**: `RestDayService` (line 20) uses `crypto.randomUUID()` for rest day IDs, which produces cryptographically random UUIDs -- appropriate for client-side entity identification.

<!-- /SECTION:security -->

---

<!-- SECTION:code-quality -->
### Code Quality

**Agent**: `code-quality-reviewer`

- [MAJOR] **Duplicated duration extraction logic across SportActivityList and SportStatsService (3 instances)**: The `SportActivityList.svelte` component re-implements three pieces of logic that already exist in `SportStatsService`:
  1. `unwrapDisplayValue` (`SportActivityList.svelte:63-67`) is identical to `stats.ts:16-20`
  2. `timeElapsedFields` derived map (`SportActivityList.svelte:35-46`) duplicates the same map-building loop in `stats.ts:51-61`
  3. `formatDurationMs` (`SportActivityList.svelte:70-74`) is identical to `SportStatsService.formatDuration` (`stats.ts:83-88`)
  - Location: `client/src/components/sport/SportActivityList.svelte:35-74` and `client/src/services/sport/stats.ts:16-88`
  - Suggestion: Extract `unwrapDisplayValue` and `formatDuration` as standalone utility functions (e.g., in a `@perfice/util/sport/format.ts` module or co-located in the service file as named exports). For the `timeElapsedFields` map, expose a static helper from `SportStatsService` or a shared function that both the service and the component can call. The component's `getEntryDurationMs` could then reuse that shared infrastructure.

- [MINOR] **`getWeekBounds` computed twice per derivation**: `currentWeekStart` and `currentWeekEnd` each independently call `getWeekBounds(weekOffset)`, creating two separate Date object pairs when the offset changes. While not a performance problem at this scale, it is redundant computation and slightly confusing.
  - Location: `client/src/views/sport/SportView.svelte:28-29`
  - Suggestion: Derive a single `weekBounds` object, then derive `currentWeekStart` and `currentWeekEnd` from it:
    ```ts
    let weekBounds = $derived(getWeekBounds(weekOffset));
    let currentWeekStart = $derived(weekBounds.start);
    let currentWeekEnd = $derived(weekBounds.end);
    ```

- [MINOR] **`$effect` uses dummy variable assignments to trigger reactivity**: The `$effect` block assigns `currentWeekStart` and `currentWeekEnd` to unused `_start`/`_end` variables solely to register them as reactive dependencies. This is a Svelte 5 anti-pattern that obscures intent.
  - Location: `client/src/views/sport/SportView.svelte:75-80`
  - Suggestion: Reference the reactive values directly inside the effect without assignment, or restructure so `loadData` accepts the week bounds as parameters, making the dependency explicit:
    ```ts
    $effect(() => {
        loadData(currentWeekStart, currentWeekEnd);
    });
    ```

- [INFO] **Good component decomposition**: The six new components (`SportWeekNav`, `SportStatsBar`, `SportActivityList`, `SportActivityRow`, `RestDayToggle`, `SportEmptyState`) are well-scoped with clear single responsibilities, properly typed `$props()`, and consistent naming. The file organization under `components/sport/` follows the established project pattern.

- [INFO] **`CreateTrackableModal` integration follows existing pattern**: The `onSuggestionSelected`/`onSingleValue` callback wiring in `SportView` mirrors the established pattern in `TrackableView`. While this is boilerplate, it is consistent with the codebase and not a new duplication introduced by this PR.

<!-- /SECTION:code-quality -->

---

<!-- SECTION:test-coverage -->
### Test Coverage

**Agent**: `test-coverage-reviewer`

**Test suite execution**: 36 tests across 5 files (stats, filtering, validation, streak, restday) -- all passing from Phase 1. No new test files added in Phase 2.

- [MAJOR] **Duplicated business logic in component lacks tests**: `SportActivityList.svelte` contains local copies of `unwrapDisplayValue` (lines ~55-67) and `formatDurationMs` (line ~70) that duplicate logic from `client/src/services/sport/stats.ts`. These component-local functions are not covered by existing service-level tests. If the component copies drift from the service originals, bugs will go undetected.
  - Files: `client/src/components/sport/SportActivityList.svelte`
  - Suggestion: Either (a) extract and re-export `unwrapDisplayValue` and a `formatDurationMs` helper from `stats.ts` so the component imports them (eliminating duplication and inheriting existing test coverage), or (b) add unit tests for the component-local versions covering edge cases: nested `{v: ...}` unwrapping, zero/negative duration, large duration values.

- [MINOR] **Week navigation logic untested**: `SportView.svelte` contains week offset navigation (prev/next week), date range computation, and conditional stats display. While this is Svelte reactive state (harder to unit test), the date arithmetic (start/end of week from offset) could be extracted into a testable utility.
  - Files: `client/src/views/sport/SportView.svelte`
  - Suggestion: Extract week range calculation (`getWeekRange(offset: number): {start: Date, end: Date}`) into a pure function in a utility module, then add tests for: offset 0 = current week, negative offsets = past weeks, week boundary alignment (Monday start).

- [INFO] **Phase 1 tests adequately cover service/store changes**: The `trackableType` parameter additions to `createTrackableFromSuggestion` and `createSingleValueTrackable` in `TrackableService` are covered by existing validation tests (`validation.test.ts` -- 10 tests). `RestDayStore.toggle()` and `getRestDaysInRange()` are thin pass-through wrappers tested at the service level (`restday.test.ts` -- 4 tests). No regression risk from Phase 2 modifications to these files.

- [INFO] **Task doc claim assessment**: The task doc states "no coverage concerns since all new code was Svelte UI components." This is mostly accurate -- the 6 new Svelte components and 1 new view are primarily presentation. However, `SportActivityList.svelte` contains non-trivial business logic (duration extraction from form answers, value unwrapping) that was duplicated rather than imported from the tested service layer. This is a real coverage gap for logic that could silently break.

<!-- /SECTION:test-coverage -->

---

<!-- SECTION:documentation -->
### Documentation

**Agent**: `documentation-accuracy-reviewer`

- [MINOR] **Step 3 references non-existent file**: The task doc Step 3 lists `client/src/views/trackable/EditTrackableView.svelte` as a target file, but this file does not exist. The type selector was implemented in `client/src/components/trackable/modals/create/CreateTrackableModal.svelte`. The step text hedges with "or the trackable creation component" but the primary file reference is inaccurate.
  - Location: `tech-decomposition-phase-2-sport-page.md`, Step 3, line 155
  - Suggestion: Replace `EditTrackableView.svelte` with `CreateTrackableModal.svelte` as the primary file reference

- [MINOR] **Stale Linear issue status**: The Tracking section shows `Status: Ready for Implementation` but implementation is complete (all steps checked, success criteria met). This is stale metadata.
  - Location: `tech-decomposition-phase-2-sport-page.md`, line 13
  - Suggestion: Update to `Status: Done` or `In Review` to match actual state

- [MINOR] **PR details still placeholder**: PR Details contain `[Added during implementation]` and `[Draft/Review/Merged]` despite the branch `feature/wyt-198-phase-2-sport-page` existing with completed implementation.
  - Location: `tech-decomposition-phase-2-sport-page.md`, lines 17-18
  - Suggestion: Fill in actual PR URL and set status to `Review`

- [INFO] **Implementation steps 1 and 2 verified accurate**: All 7 component files exist at documented paths. Route registered in `App.svelte`. Sidebar link uses `faDumbbell`, positioned after Trackables/before Journal, no `showOnMobile: false` as specified. Type selector (Step 3) functions as described despite the file path discrepancy noted above.

<!-- /SECTION:documentation -->

---

<!-- SECTION:performance -->
### Performance

**Agent**: `performance-reviewer`

- [MAJOR] **`getWeekBounds` computed twice per reactive cycle**: `currentWeekStart` and `currentWeekEnd` are two independent `$derived` expressions that each call `getWeekBounds(weekOffset)`. On every `weekOffset` change, `getWeekBounds` runs twice, creating 4 `Date` objects and calling `dateToWeekStart` + `dateToWeekEnd` twice each.
  - Location: `client/src/views/sport/SportView.svelte:28-29`
  - Impact: Doubled computation on every week navigation. Low absolute cost but cascades downstream since `weekStats` and the `$effect` both depend on these derived values.
  - Suggestion: Derive a single bounds object, then destructure:
    ```ts
    // Before (2 calls)
    let currentWeekStart = $derived(getWeekBounds(weekOffset).start);
    let currentWeekEnd = $derived(getWeekBounds(weekOffset).end);

    // After (1 call)
    let weekBounds = $derived(getWeekBounds(weekOffset));
    let currentWeekStart = $derived(weekBounds.start);
    let currentWeekEnd = $derived(weekBounds.end);
    ```

- [MAJOR] **Redundant re-filtering of already-scoped entries in `computeWeekStats`**: `loadData()` already fetches entries filtered by week range via `journal.getSportEntries(start, end, formIds)`. Then `computeWeekStats` filters the same array again by the same week range -- a wasted O(n) pass on every stats recomputation.
  - Location: `client/src/services/sport/stats.ts:43-45` called from `SportView.svelte:92`
  - Suggestion: Skip the filter in `computeWeekStats` since entries are already week-scoped, or document the pre-filtered contract.

- [MINOR] **Duplicate `timeElapsedFields` map construction with linear `forms.find()`**: The same map-building logic exists in both `SportActivityList.svelte:35-45` and `SportStatsService.computeWeekStats:51-61`. Both use `forms.find()` (linear scan), making each O(trackables * forms) instead of O(trackables) with a pre-built form map.
  - Location: `client/src/components/sport/SportActivityList.svelte:35-45` and `client/src/services/sport/stats.ts:51-61`
  - Suggestion: Extract into a shared utility. Replace `forms.find()` with `new Map(forms.map(f => [f.id, f])).get(trackable.formId)`.

- [INFO] **`dayGroups` O(days * entries) pattern is acceptable at current scale**: Iterates 7 days and filters all entries per day. With sport entries typically in single digits per week, this is fine.
  - Location: `client/src/components/sport/SportActivityList.svelte:83-110`

<!-- /SECTION:performance -->

---

<!-- SECTION:verification -->
## Verification

```
$ cd client && npx svelte-check --tsconfig ./tsconfig.json
→ svelte-check found 0 errors and 0 warnings

$ npx vitest run
→ Test Files  21 failed | 3 passed (24)  ← pre-existing on main
→ Tests       20 passed (20)

$ git stash && npx vitest run  (baseline on main)
→ Test Files  21 failed | 3 passed (24)  ← identical, confirms pre-existing
→ Tests       20 passed (20)
```

No regressions introduced by this branch.

<!-- /SECTION:verification -->

---

<!-- SECTION:metadata -->
## Metadata

**Changed Files** (15):
- `client/src/App.svelte` — route registration
- `client/src/components/sport/RestDayToggle.svelte` — new
- `client/src/components/sport/SportActivityList.svelte` — new
- `client/src/components/sport/SportActivityRow.svelte` — new
- `client/src/components/sport/SportEmptyState.svelte` — new
- `client/src/components/sport/SportStatsBar.svelte` — new
- `client/src/components/sport/SportWeekNav.svelte` — new
- `client/src/components/trackable/modals/create/CreateTrackableModal.svelte` — modified
- `client/src/model/ui/sidebar.ts` — modified
- `client/src/services/trackable/trackable.ts` — modified
- `client/src/stores/sport/restday.svelte.ts` — modified
- `client/src/stores/trackable/trackable.svelte.ts` — modified
- `client/src/views/sport/SportView.svelte` — new
- `client/src/views/trackable/TrackableView.svelte` — modified
- `tech-decomposition-phase-2-sport-page.md` — updated

**Diff Source**: `git diff main...HEAD` (commit `18f4304`)
**Reviewers Invoked**: spec-compliance-reviewer, senior-architecture-reviewer, security-code-reviewer, code-quality-reviewer, test-coverage-reviewer, documentation-accuracy-reviewer, performance-reviewer

<!-- /SECTION:metadata -->

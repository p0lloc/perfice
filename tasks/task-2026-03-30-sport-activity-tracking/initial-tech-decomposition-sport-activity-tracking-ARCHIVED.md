# Technical Decomposition: Sport Activity Tracking

**Feature**: sport-activity-tracking
**Date**: 2026-03-31
**Source**: `discovery-sport-activity-tracking.md` (Final, Cross-AI Validated)
**Visual Prototype**: APPROVED (`vp-approval.md`)

---

## Primary Objective

Add a dedicated sport activity tracking surface to Perfice: a `trackableType` flag on the Trackable entity, a new Sport page (`/sport`) with weekly stats and day-grouped activity list, a RestDay entity with streak-aware logic, a `SPORT_SUMMARY` dashboard widget with quick-log, and a Sport nav item — all integrated with existing sync, journal, goals, and analytics systems.

---

## Must Haves

Non-negotiable truths when this task is complete:

- [ ] `Trackable` entity has a `trackableType: 'regular' | 'sport'` field; existing trackables default to `'regular'`
- [ ] Dexie schema bumped to v26 with migration setting `trackableType: 'regular'` on all existing rows
- [ ] `RestDay` entity exists as a first-class Dexie table with sync support
- [ ] Sport page at `/sport` displays week-scoped stats bar (sessions, duration, streak), day-grouped activity list, and rest day toggles
- [ ] Stats bar duration sums ALL `TIME_ELAPSED` fields across all sport entries in the selected week
- [ ] Streak calculation correctly handles active days, rest days (preserve not increment), and "today pending" logic
- [ ] Sport trackable creation enforces at least one `TIME_ELAPSED` form question
- [ ] `SPORT_SUMMARY` dashboard widget shows weekly stats with quick-log dropdown
- [ ] Sport nav item appears in sidebar and mobile bottom bar (6 items total)
- [ ] All existing tests continue to pass
- [ ] Read-layer uses `trackableType ?? 'regular'` as safety net for unmigrated rows
- [ ] New unit tests cover streak calculation, rest day toggling, duration aggregation, and type validation

---

## Implementation Decisions

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Trackable deletion → journal entries | Preserve entries (no cascade) | Matches existing behavior; entries survive as orphans |
| 2 | Duration format in stats | Always `Xh Ym` (e.g., `0h 45m`) | Consistent format, no conditional logic needed |
| 3 | Week start source | Use existing `weekStart` store | Consistent with rest of app; already user-configurable |
| 4 | Sport stats computation layer | View-layer only (no Variables) | Avoids dual-math complexity; keeps MVP scope tight (discovery decision #7) |
| 5 | RestDay conflict resolution | Last-write-wins by `timestamp` | Simple, predictable; matches sync patterns |

---

## Test Plan

### TP-1: Streak Calculation [REQ-STREAK]

**TP-1.1: Basic streak counting**
- **Given** sport entries exist on Mon, Tue, Wed (consecutive days)
- **When** streak is calculated from Wed
- **Then** streak equals 3

**TP-1.2: Streak breaks on inactive day**
- **Given** sport entries exist on Mon, Tue, Thu (Wed missing)
- **When** streak is calculated from Thu
- **Then** streak equals 1 (only Thu counts; Wed breaks it)

**TP-1.3: Rest day preserves but doesn't increment streak**
- **Given** sport entries on Mon and Wed, rest day on Tue
- **When** streak is calculated from Wed
- **Then** streak equals 2 (Mon + Wed; Tue preserved)

**TP-1.4: Today with no entry is "pending" — doesn't break streak**
- **Given** today is Thu with no entry; sport entries on Wed, Tue, Mon
- **When** streak is calculated from Thu (today)
- **Then** streak equals 3 (Wed + Tue + Mon; today skipped as pending)

**TP-1.5: Today with entry counts toward streak**
- **Given** today is Thu with a sport entry; entries also on Wed, Tue
- **When** streak is calculated from Thu
- **Then** streak equals 3

**TP-1.6: Today is rest day — preserves, start counting from yesterday**
- **Given** today is Thu marked as rest; sport entries on Wed, Tue
- **When** streak is calculated from Thu
- **Then** streak equals 2 (Wed + Tue; today preserved)

**TP-1.7: Multiple entries same day count as 1**
- **Given** two sport entries on Mon, one on Tue
- **When** streak is calculated from Tue
- **Then** streak equals 2

**TP-1.8: Rest day AND sport entry on same day — sport takes precedence**
- **Given** sport entry AND rest day toggle on Mon; sport entry on Tue
- **When** streak is calculated from Tue
- **Then** streak equals 2 (Mon counted as active, not rest)

**TP-1.9: Empty history — streak is 0**
- **Given** no sport entries and no rest days exist
- **When** streak is calculated
- **Then** streak equals 0

**TP-1.10: All rest days, no sport entries — streak is 0**
- **Given** rest days on Mon, Tue, Wed but no sport entries
- **When** streak is calculated from Wed
- **Then** streak equals 0 (rest days preserve but nothing to preserve)

### TP-2: Rest Day Service [REQ-RESTDAY]

**TP-2.1: Toggle rest day ON creates a RestDay record**
- **Given** no rest day exists for 2026-03-30
- **When** rest day is toggled on for 2026-03-30
- **Then** a RestDay record is created with `date: '2026-03-30'` and a timestamp

**TP-2.2: Toggle rest day OFF deletes the RestDay record**
- **Given** a rest day exists for 2026-03-30
- **When** rest day is toggled off for 2026-03-30
- **Then** the RestDay record for 2026-03-30 is deleted

**TP-2.3: Toggle ON is idempotent**
- **Given** a rest day already exists for 2026-03-30
- **When** rest day is toggled on again for 2026-03-30
- **Then** no new record is created; exactly one record exists

**TP-2.4: Query rest days by date range**
- **Given** rest days exist for 2026-03-25, 2026-03-27, 2026-03-30
- **When** querying rest days for range 2026-03-24 to 2026-03-30
- **Then** all three rest days are returned

### TP-3: Sport Stats Computation [REQ-STATS]

**TP-3.1: Session count for a week**
- **Given** 3 sport journal entries in the selected week
- **When** sessions stat is computed
- **Then** count equals 3

**TP-3.2: Duration sums all TIME_ELAPSED fields**
- **Given** a sport entry with two TIME_ELAPSED fields: "Warmup" = 900000ms (15min), "Main Set" = 2700000ms (45min)
- **When** total duration is computed for the week
- **Then** duration equals 3600000ms (1h 0m), formatted as "1h 0m"

**TP-3.3: Duration across multiple entries**
- **Given** entry A with TIME_ELAPSED = 30min, entry B with TIME_ELAPSED = 45min
- **When** total duration is computed
- **Then** duration equals 75min, formatted as "1h 15m"

**TP-3.4: Zero entries in week**
- **Given** no sport entries in the selected week
- **When** stats are computed
- **Then** sessions = 0, duration = "0h 0m", streak = current streak (calculated globally)

**TP-3.5: Duration format is always Xh Ym**
- **Given** total duration is 45 minutes
- **When** formatted
- **Then** output is "0h 45m" (not "45m")

### TP-4: Trackable Type Validation [REQ-CREATE]

**TP-4.1: Sport trackable requires TIME_ELAPSED field**
- **Given** a new trackable being created with `trackableType: 'sport'`
- **When** the form has no TIME_ELAPSED question
- **Then** validation fails with error "Sport trackables require at least one duration (time elapsed) field"

**TP-4.2: Sport trackable with TIME_ELAPSED passes validation**
- **Given** a new trackable with `trackableType: 'sport'`
- **When** the form has at least one TIME_ELAPSED question
- **Then** validation passes

**TP-4.3: Regular trackable has no TIME_ELAPSED requirement**
- **Given** a new trackable with `trackableType: 'regular'`
- **When** the form has no TIME_ELAPSED question
- **Then** validation passes

### TP-5: Type Switching [REQ-SWITCH]

**TP-5.1: Regular → Sport allowed with TIME_ELAPSED**
- **Given** a regular trackable whose form has a TIME_ELAPSED question
- **When** type is switched to 'sport'
- **Then** switch succeeds; trackableType is 'sport'

**TP-5.2: Regular → Sport blocked without TIME_ELAPSED**
- **Given** a regular trackable whose form has no TIME_ELAPSED question
- **When** type is switched to 'sport'
- **Then** switch fails with validation error

**TP-5.3: Sport → Regular always allowed**
- **Given** a sport trackable
- **When** type is switched to 'regular'
- **Then** switch succeeds; trackable disappears from Sport page

**TP-5.4: Removing last TIME_ELAPSED from sport trackable is blocked**
- **Given** a sport trackable with one TIME_ELAPSED question
- **When** that question is removed from the form
- **Then** validation fails with error "Sport trackables require at least one duration field"

### TP-6: Migration [REQ-SCHEMA]

**TP-6.1: Existing trackables receive 'regular' type**
- **Given** existing trackables in Dexie v25 without `trackableType`
- **When** migration to v26 runs
- **Then** all existing trackables have `trackableType: 'regular'`

**TP-6.2: RestDay table is created**
- **Given** Dexie v25 database
- **When** migration to v26 runs
- **Then** `restDays` table exists with `id` and `date` indices

### TP-7: Sport Trackable Filtering [REQ-STORE]

**TP-7.1: getSportTrackables returns only sport type**
- **Given** 3 trackables: 2 regular, 1 sport
- **When** `getSportTrackables()` is called
- **Then** only the 1 sport trackable is returned

**TP-7.2: getSportEntries returns entries matching sport trackable formIds**
- **Given** sport trackable with formId "f1", regular trackable with formId "f2", journal entries for both
- **When** `getSportEntries(weekStart, weekEnd)` is called
- **Then** only entries with formId "f1" are returned

### TP-7.5: Edge Cases [REQ-STATS] [REQ-STREAK]

**TP-7.5.1: Zero-duration TIME_ELAPSED entry**
- **Given** a sport entry with TIME_ELAPSED = 0ms
- **When** duration is computed
- **Then** duration includes 0ms (formatted as "0h 0m"); session still counted

**TP-7.5.2: Very large duration formatting**
- **Given** total duration is 6000 minutes (100 hours)
- **When** formatted
- **Then** output is "100h 0m" (no overflow or truncation)

**TP-7.5.3: Empty database — getSportTrackables returns empty**
- **Given** no trackables exist at all
- **When** `getSportTrackables()` is called
- **Then** returns empty array (no error)

**TP-7.5.4: Streak with different week start settings**
- **Given** identical sport entries
- **When** streak is calculated with MONDAY week start vs SUNDAY week start
- **Then** streak value is identical (streak is day-based, not week-based)

### TP-8: Dashboard Widget [REQ-WIDGET]

**TP-8.1: SPORT_SUMMARY widget type is registered**
- **Given** dashboard widget definitions
- **When** looking up SPORT_SUMMARY
- **Then** definition exists with correct default dimensions (3x1) and settings

**TP-8.2: Widget stats match Sport page stats**
- **Given** same sport entries and rest days
- **When** widget stats and page stats are computed
- **Then** sessions, duration, and streak values are identical

---

## Implementation Steps

### Step 1: Add `trackableType` to Trackable model — **Wave 1** [REQ-MODEL]

**Files**:
- `client/src/model/trackable/trackable.ts`

**Changes**:
- Add `TrackableType` type: `'regular' | 'sport'`
- Add `trackableType: TrackableType` to the base object fields (before the `& TrackableCardSettings` intersection), not inside the union discriminant:

```typescript
export type TrackableType = 'regular' | 'sport';

export type Trackable = {
    id: string;
    name: string;
    icon: string;
    formId: string;
    order: number;
    goalId: string | null;
    categoryId: string | null;
    dependencies: Record<string, string>;
    trackableType: TrackableType;  // ← add here, in the base object
} & TrackableCardSettings;
```

- **Read-layer safety**: Any code reading `trackable.trackableType` should use `trackable.trackableType ?? 'regular'` to handle rows that haven't been migrated yet (belt-and-suspenders with the migration).

**Changelog**: Add `trackableType` field to Trackable entity type definition

---

### Step 2: Add `RestDay` model type — **Wave 1** [REQ-RESTDAY]

**Files**:
- `client/src/model/sport/restday.ts` (NEW — create `model/sport/` directory)

**Changes**:
- Create `RestDay` interface: `{ id: string; date: string; timestamp: number; }`
- Export the type

**New directories created in this task** (flagged here for reference):
- `client/src/model/sport/`
- `client/src/services/sport/` (Steps 5, 7, 8)
- `client/src/stores/sport/` (Step 6)
- `client/src/views/sport/` (Step 12)
- `client/src/components/sport/` (Step 12)
- `client/src/components/dashboard/types/sportSummary/` (Step 15)
- `client/src/components/dashboard/sidebar/edit/types/sportSummary/` (Step 15)

**Changelog**: Create RestDay entity type

---

### Step 3: Bump Dexie schema to v26 with migration — **Wave 2** [REQ-SCHEMA]

**Files**:
- `client/src/db/dexie/db.ts`
- `client/src/db/dexie/migration.ts`

**Changes in `db.ts`**:
- Add `restDays: Table<RestDay>` to `DexieDB` type
- Bump to `db.version(26).stores({...})` — NO `.upgrade()` call (this codebase uses `DexieMigrator` instead):
  - `trackables`: `"id, categoryId, trackableType"` (add `trackableType` index)
  - `restDays`: `"id, date"` (new table)
  - All other stores: copy existing v25 schema unchanged

**Changes in `migration.ts`** (CRITICAL — actual migration logic lives here, not in Dexie's `.upgrade()`):
- Add a new `Migration` object to `DexieMigrator` for v25→v26
- Migration function: iterate all `trackables` rows and set `trackableType: 'regular'` via `bulkPut`
- Follow existing `DexieMigrator` pattern — read the class to understand the `Migration[]` registry

**Changelog**: Bump Dexie to v26, add trackableType index on trackables, create restDays table, migrate existing trackables to 'regular' via DexieMigrator

---

### Step 4: Add `RestDayCollection` interface and implementations — **Wave 2** [REQ-RESTDAY]

**Files**:
- `client/src/db/collections.ts` — add `RestDayCollection` interface + `restDays` to `Collections`
- `client/src/db/dexie/restday.ts` (NEW) — `DexieRestDayCollection` implementing `RestDayCollection`
- `client/tests/dummy-collections.ts` — add `DummyRestDayCollection` test double (existing file already contains Dummy*Collection classes for other entities)

**`RestDayCollection` interface**:
```typescript
export interface RestDayCollection {
    getRestDays(): Promise<RestDay[]>;
    getRestDayByDate(date: string): Promise<RestDay | undefined>;
    getRestDaysByDateRange(startDate: string, endDate: string): Promise<RestDay[]>;
    createRestDay(restDay: RestDay): Promise<void>;
    deleteRestDayByDate(date: string): Promise<void>;
    deleteRestDayById(id: string): Promise<void>;
}
```

**`DexieRestDayCollection`**: Follows pattern from `DexieGoalCollection` — wraps `SyncedTable<RestDay>`, queries use Dexie's `.where('date').between(...)`.

**Wire up in `db.ts` `setupDb()`**: Create `SyncedTable(db.restDays, "restDays", syncServiceProvider)` → `DexieRestDayCollection`

**Changelog**: Add RestDayCollection interface, Dexie implementation, and Dummy test double

---

### Step 5: Create `RestDayService` and wire into Services registry — **Wave 3** [REQ-RESTDAY]

**Files**:
- `client/src/services/sport/restday.ts` (NEW)
- `client/src/services.ts` — add `restDay: RestDayService` to `Services` interface + instantiate in `setupServices()`

**Interface**:
```typescript
class RestDayService {
    toggle(date: string): Promise<void>; // idempotent create or delete
    isRestDay(date: string): Promise<boolean>;
    getRestDaysInRange(startDate: string, endDate: string): Promise<RestDay[]>;
}
```

**Logic**:
- `toggle()`: Check if record exists for `date`. If yes → delete. If no → create with `id: generateId()`, `date`, `timestamp: Date.now()`.
- Observer pattern: use `EntityObservers<RestDay>` with CREATED/DELETED events (same pattern as `GoalService`)

**Wiring in `services.ts`**:
- Add `readonly restDay: RestDayService` to `Services` interface
- In `setupServices()`: `restDay: new RestDayService(collections.restDays)`

**Changelog**: Create RestDayService with idempotent toggle logic; register in Services interface

---

### Step 6: Create `RestDayStore` with sync observer — **Wave 3** [REQ-RESTDAY]

**Files**:
- `client/src/stores/sport/restday.svelte.ts` (NEW)
- `client/src/stores.ts` — register in `StoreProvider.setup()` + add sync observer

**Pattern**: Follow `GoalStore` — extend `AsyncStore<RestDay[]>`, listen to service observer callbacks for CREATED/DELETED.

**Sync observer wiring in `StoreProvider.setup()`**:
```typescript
this.services.sync.addObserver("restDays", async (updates) => {
    restDays.applySyncUpdates(updates);
});
```
Without this, remote sync updates write to Dexie but the in-memory store stays stale until page reload.

**Changelog**: Create RestDayStore, register in StoreProvider, add sync observer for restDays table

---

### Step 7: Create `SportStreakService` — **Wave 3** [REQ-STREAK]

**Files**:
- `client/src/services/sport/streak.ts` (NEW)

**Interface**:
```typescript
class SportStreakService {
    calculateStreak(
        sportEntries: JournalEntry[],
        restDays: RestDay[],
        today: Date
    ): number;
}
```

**Logic**: Implement pseudocode from discovery Section 7 exactly:
1. Check if today has entry → streak = 1, start from yesterday
2. Check if today is rest → start from yesterday (preserve)
3. Else → start from yesterday (today pending)
4. Walk backwards: entry → +1, rest → preserve, neither → break

**Changelog**: Create SportStreakService with streak calculation algorithm

---

### Step 8: Create `SportStatsService` — **Wave 3** [REQ-STATS]

**Files**:
- `client/src/services/sport/stats.ts` (NEW)

**Interface**:
```typescript
interface SportWeekStats {
    sessions: number;
    totalDurationMs: number;
    streak: number;
}

class SportStatsService {
    computeWeekStats(
        sportEntries: JournalEntry[],
        sportTrackables: Trackable[],
        forms: Form[],
        restDays: RestDay[],
        weekStart: Date,
        weekEnd: Date,
        today: Date
    ): SportWeekStats;

    formatDuration(ms: number): string; // always "Xh Ym"
}
```

**Duration calculation**:
1. For each sport entry, find its form via `formId` → find snapshot via `snapshotId`
2. Iterate form questions, find all with `dataType === 'TIME_ELAPSED'`
3. Sum the corresponding answer values from the entry's `answers` record
4. Sum across all entries in the week

**Changelog**: Create SportStatsService with session count, duration aggregation, and formatting

---

### Step 9: Add sport trackable validation to `TrackableService` — **Wave 3** [REQ-CREATE]

**Files**:
- `client/src/services/trackable/trackable.ts` (existing)

**Changes**:
- Add validation in trackable create/update path: if `trackableType === 'sport'`, verify form has at least one question with `dataType === FormQuestionDataType.TIME_ELAPSED`
- Add validation in form question delete path: if parent trackable is sport, block removal of last TIME_ELAPSED question
- Add type switching validation: regular→sport requires TIME_ELAPSED check

**Changelog**: Add sport trackable TIME_ELAPSED validation rules

---

### Step 10: Extend `TrackableStore` with sport filtering — **Wave 3** [REQ-STORE]

**Files**:
- `client/src/stores/trackable/trackable.svelte.ts`

**Changes**:
- Add derived method/getter: `getSportTrackables()` — filters loaded trackables by `trackableType === 'sport'`

**Changelog**: Add getSportTrackables() filter to TrackableStore

---

### Step 11: Add sport entry querying to journal layer — **Wave 3** [REQ-STORE]

**Files**:
- `client/src/stores/journal/entry.ts`

**Changes**:
- Add method `getSportEntries(weekStart: number, weekEnd: number, sportFormIds: string[]): Promise<JournalEntry[]>`
- Implementation: use existing `getEntriesByTimeRange()`, then filter in-memory by `formId in sportFormIds`

**Changelog**: Add getSportEntries method for sport-scoped journal queries

---

### Step 12: Create Sport page components — **Wave 4** [REQ-PAGE] [REQ-STATS] [REQ-LIST] [REQ-WEEKNAV]

**Files** (all NEW):
- `client/src/views/sport/SportView.svelte` — main page container
- `client/src/components/sport/SportStatsBar.svelte` — 3-stat bar (sessions, duration, streak)
- `client/src/components/sport/SportWeekNav.svelte` — week navigation with arrows
- `client/src/components/sport/SportActivityList.svelte` — day-grouped entry list
- `client/src/components/sport/SportActivityRow.svelte` — single entry row (icon, name, duration, time)
- `client/src/components/sport/RestDayToggle.svelte` — per-day rest day toggle
- `client/src/components/sport/SportEmptyState.svelte` — "Get Started" card for no sport trackables

**SportView structure** (follows GoalView pattern):
```
MobileTopBar
SportWeekNav  ← uses $weekStart store from stores/ui/weekStart.ts for week boundaries
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
- Week nav: "Mar 24 – Mar 30" format with chevron arrows
- Rest day toggle: inline per-day with blue highlight when active
- Empty state: centered card with CTA pre-setting `trackableType: 'sport'`

**Changelog**: Create Sport page with stats bar, week navigation, activity list, rest day toggles, and empty state

---

### Step 13: Add Sport route and navigation — **Wave 4** [REQ-NAV] [REQ-ROUTE]

**Files**:
- `client/src/App.svelte` — add `{ path: "/sport", component: SportView }` to routes array
- `client/src/model/ui/sidebar.ts` — add `{ icon: faDumbbell, path: "/sport", title: "Sport" }` to `SIDEBAR_LINKS` after Trackables, before Journal. Do NOT set `showOnMobile: false` — Sport must appear in mobile bottom bar (6 items total).

**Changelog**: Add /sport route and Sport nav item (sidebar + bottom bar)

---

### Step 14: Add trackable type selector to creation flow — **Wave 4** [REQ-CREATE]

**Files**:
- `client/src/views/trackable/EditTrackableView.svelte` or the trackable creation component
- `client/src/components/trackable/` — wherever the creation wizard lives

**Changes**:
- Add a "Trackable Type" selector at the top of creation form: Regular (default) | Sport
- When Sport selected: set `trackableType: 'sport'` on the trackable being created
- Show validation error if saving sport trackable without TIME_ELAPSED field
- When navigating from Sport page "Add" button: pre-select Sport type

**Changelog**: Add trackable type selector (Regular/Sport) to creation flow with TIME_ELAPSED validation

---

### Step 15: Create `SPORT_SUMMARY` dashboard widget — **Wave 5** [REQ-WIDGET]

**Files** (following existing widget pattern — note: TWO RENDERERS maps exist):
- `client/src/model/dashboard/widgets/sportSummary.ts` (NEW) — settings type + definition class
  - `DashboardSportSummaryWidgetDefinition.createDependencies()` returns `new Map()` (stats bypass Variable system)
- `client/src/model/dashboard/dashboard.ts` — add `SPORT_SUMMARY` to `DashboardWidgetType` enum, add to settings union, add to `definitions` map
- `client/src/components/dashboard/types/sportSummary/DashboardSportSummaryWidget.svelte` (NEW) — widget display renderer
- `client/src/components/dashboard/sidebar/edit/types/sportSummary/EditSportSummaryWidgetSidebar.svelte` (NEW) — widget settings editor
- `client/src/components/sport/SportQuickLog.svelte` (NEW) — quick-log dropdown
- `client/src/components/dashboard/DashboardWidgetRenderer.svelte` — add to display `RENDERERS` map
- `client/src/components/dashboard/sidebar/edit/EditWidgetSidebar.svelte` — add to edit `RENDERERS` map

**Widget definition**:
- Min size via `getMinWidth()`/`getMinHeight()`: 2×1 grid units
- Default size at creation time: w=3, h=1 (set in `createDefaultWidget()` method, not via min getters)
- Settings: `{ name: string }` (default: "Sport This Week")
- Quick-log [+]: dropdown listing sport trackables by icon + name, tapping opens FormModal

**Changelog**: Create SPORT_SUMMARY dashboard widget with stats display, settings editor, and quick-log dropdown

---

### Step 16: Write unit tests — **Wave 2** (streak + restday tests), **Wave 4** (integration) [REQ-STREAK] [REQ-RESTDAY] [REQ-STATS]

**Files**:
- `client/tests/sport/streak.test.ts` (NEW) — tests for TP-1 (all 10 streak scenarios)
- `client/tests/sport/restday.test.ts` (NEW) — tests for TP-2 (toggle idempotency, range query)
- `client/tests/sport/stats.test.ts` (NEW) — tests for TP-3 (duration summation, formatting)
- `client/tests/sport/validation.test.ts` (NEW) — tests for TP-4 and TP-5 (type validation, switching)
- `client/tests/sport/filtering.test.ts` (NEW) — tests for TP-7 (sport trackable filtering)

**Pattern**: Pure-function services (`SportStreakService.calculateStreak`, `SportStatsService.computeWeekStats`) accept data directly as arguments — construct input arrays in tests, no collection doubles needed. Follow existing `tests/common.ts` `mockEntry()` helper style. For `RestDayService` integration tests, use `DummyRestDayCollection` (add to existing `client/tests/dummy-collections.ts` alongside other Dummy*Collection classes).

**Test commands**: `npm run test` (from `client/` directory)

**Changelog**: Add comprehensive test suite for sport activity tracking (streak, rest days, stats, validation, filtering)

---

## Wave Summary

| Wave | Steps | Description | Parallelizable |
|------|-------|-------------|----------------|
| **1** | 1, 2 | Model types (Trackable type flag, RestDay interface) | Yes (different files) |
| **2** | 3, 4, 16a | DB schema + collections + streak/restday tests | Partially (3→4 sequential; 16a parallel with 4) |
| **3** | 5, 6, 7, 8, 9, 10, 11 | Services + stores (RestDay, Streak, Stats, validation, filtering) | Partially (5→6 sequential; 7,8,9,10,11 parallel) |
| **4** | 12, 13, 14, 16b | UI components + routing + nav + integration tests | Partially (12,13,14 parallel; 16b after) |
| **5** | 15 | Dashboard widget | Sequential (needs stores from Wave 3) |

---

## Dependencies

- **Wave 2 depends on Wave 1**: Schema changes reference new model types
- **Wave 3 depends on Wave 2**: Services use collection interfaces
- **Wave 4 depends on Wave 3**: UI components consume stores/services
- **Wave 5 depends on Wave 3**: Widget uses sport stores/services
- **No external dependencies**: All changes are within the client/ directory

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Dexie migration fails on existing data | Low | High | Test migration with populated database; bulkPut is safe for existing rows |
| 6-item bottom bar crowded on small screens | Medium | Low | VP approved at 375px; can adjust padding if needed |
| Streak calculation edge cases | Medium | Medium | Comprehensive test suite (10 scenarios) covers all documented edge cases |
| TIME_ELAPSED field value format varies | Low | Medium | Normalize to milliseconds; existing TIME_ELAPSED fields already store ms |

---

## Tracking & Progress

- **Linear Issue**: _To be created_
- **Branch**: `feature/sport-activity-tracking`
- **PR**: _To be created_

---

## Cross-AI Validation

**Status**: SKIPPED — CLI agents failed to produce usable output. Mitigated by:
1. Discovery document already passed cross-AI validation (Gemini PASS, Cursor/Codex FAIL→fixed, consolidated PASS)
2. Tech decomposition reviewed by plan-reviewer (9 issues) + senior-architecture-reviewer (7 issues) — all addressed

---

## Review History

| Reviewer | Verdict | Issues Found | Issues Fixed |
|----------|---------|-------------|-------------|
| plan-reviewer | NEEDS REVISIONS (7/10) | 3 CRITICAL, 6 MAJOR | All fixed |
| senior-architecture-reviewer | MINOR_ADJUSTMENTS | 3 MAJOR, 4 MINOR | All fixed |
| Cross-AI (Codex/Gemini/Cursor) | SKIPPED | — | — |

---

## References

- Discovery: `tasks/task-2026-03-30-sport-activity-tracking/discovery-sport-activity-tracking.md`
- Visual Prototype: `tasks/task-2026-03-30-sport-activity-tracking/playground-sport-activity-tracking.html`
- VP Approval: `tasks/task-2026-03-30-sport-activity-tracking/vp-approval.md`

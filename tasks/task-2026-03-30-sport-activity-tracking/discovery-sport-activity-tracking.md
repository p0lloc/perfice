# Feature Discovery: Sport Activity Tracking

**Status**: Final
**Date**: 2026-03-30
**Feature Slug**: sport-activity-tracking

---

## 1. Problem Statement

Perfice currently tracks habits, metrics, and goals through its flexible Trackable/Form system, but has no dedicated surface for sport and workout activities. Users who track fitness activities alongside other life metrics need:

- A **purpose-built page** to view their sport activities with relevant stats at a glance
- A **dashboard widget** for quick weekly sport summaries without navigating away
- A way to **distinguish sport trackables** from regular ones for filtering and aggregation

The existing Trackable system already supports the data modeling (duration, distance, reps via form fields). This feature builds **a dedicated UX layer** on top of existing infrastructure, but also requires **model changes** (trackable type flag), **schema/migration work** (Dexie v26), **a new entity** (RestDay with sync), **a new dashboard widget type**, and **navigation changes**. It is not a thin UI-only change — it touches model, persistence, sync, dashboard, and routing layers.

---

## 2. Design Decisions

### 2.1 Data Model: Trackable Type Flag

**Decision**: Add a `trackableType` field to the `Trackable` entity.

```typescript
type TrackableType = 'regular' | 'sport';

// Added to Trackable interface:
trackableType: TrackableType; // defaults to 'regular'
```

**Rationale**: Simplest approach. A flag on the existing model avoids indirection of wrapper entities and leverages all existing infrastructure (variables, goals, analytics, journal, sync).

**Migration**: Requires Dexie version bump (v25 → v26 in `client/src/db/dexie/db.ts`). Existing `Trackable` rows won't have `trackableType` — the `DexieMigrator` must set `trackableType: 'regular'` on all existing rows via `bulkPut`. The read layer should also default missing `trackableType` to `'regular'` for safety.

**Constraint**: Sport trackables **must have at least one `TIME_ELAPSED` form question** (duration). This is validated at creation/edit time. Duration is the universal metric that enables meaningful aggregation across different sport types.

### 2.2 Rest Day Tracking

**Decision**: Per-day "rest day" toggle on the Sport page.

**Storage**: New first-class Dexie table (not a key-value store) following the existing entity pattern:

```typescript
interface RestDay {
  id: string;       // auto-generated
  date: string;     // local calendar date (YYYY-MM-DD) — used as logical key
  timestamp: number; // epoch ms of when the toggle was set
}
```

**Uniqueness**: One `RestDay` row per local calendar date. The toggle is **idempotent** — toggling on an already-rest day is a no-op; toggling off deletes the row. The `date` field is indexed and unique-per-device.

**Timezone**: Uses the device's local calendar date (not UTC). A day boundary is midnight in the user's local timezone.

**Sync**: `RestDay` is a synced entity type (added to `SyncedTable` like other entities). Conflict resolution: **last-write-wins** by `timestamp`. Duplicate `date` entries after sync are deduplicated — keep the one with the latest `timestamp`.

**Behavior**:
- Rest days **preserve** the current streak (don't reset it) but **don't increment** it
- A day is either: active (has sport entries), rest (marked explicitly), or inactive (neither — breaks streak)
- Rest days are toggled from the Sport page's day view

### 2.3 Visibility

Sport trackables are **full citizens** of the system:
- Appear on the **Sport page** (primary home)
- Appear on the **Trackables page** (alongside regular trackables, no filtering)
- Entries appear in the **Journal** (like any other journal entry)
- Work with **Goals** (reuse existing goal system)
- Work with **Analytics** (correlations, insights)
- Participate in **Sync** (same as any trackable)

---

## 3. Sport Page (`/sport`)

### 3.1 Layout

```
┌─────────────────────────────────────┐
│  ◄  Week of Mar 24 – Mar 30   ►    │  ← Week navigation
├─────────────────────────────────────┤
│  🏃 3 sessions  ⏱ 2h 45m  🔥 5d   │  ← Stats bar
├─────────────────────────────────────┤
│                                     │
│  Today, Mar 30                      │
│  ┌─────────────────────────────┐    │
│  │ 🏊 Swimming    45min  10:30│    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 😴 Rest Day          toggle│    │
│  └─────────────────────────────┘    │
│                                     │
│  Saturday, Mar 29                   │
│  ┌─────────────────────────────┐    │
│  │ 🏃 Running     30min  08:00│    │
│  └─────────────────────────────┘    │
│                                     │
│  Friday, Mar 28                     │
│  ┌─────────────────────────────┐    │
│  │ 🧘 Yoga        60min  18:00│    │
│  └─────────────────────────────┘    │
│                                     │
│                            [+ Add]  │  ← FAB or button
└─────────────────────────────────────┘
```

### 3.2 Stats Bar

Three stats, scoped to the currently selected week:

| Stat | Calculation |
|------|-------------|
| **Sessions** | Count of sport journal entries in the selected week |
| **Total Duration** | Sum of **all** `TIME_ELAPSED` field values across all sport entries in the selected week (if a form has multiple duration fields, e.g., "Warmup" + "Main Set", all are summed). Format: `Xh Ym` |
| **Current Streak** | Consecutive calendar days (as of today) with at least one sport entry. Rest days preserve but don't increment. |

Streak is always calculated from today backwards, regardless of which week is selected.

### 3.3 Activity List

- **Grouped by day** within the selected week
- Each entry row shows: **sport trackable icon** | **sport name** | **duration** (from TIME_ELAPSED field) | **timestamp** (HH:MM)
- **Tapping an entry** expands it to show all logged form field values
- Days without entries show "No activity" or the rest day toggle
- **Rest day toggle**: Per-day, simple toggle button. When toggled on, shows "Rest Day" badge for that day

### 3.4 Week Navigation

- Default: current week (Mon–Sun or Sun–Sat based on locale)
- Back/forward arrows navigate one week at a time
- Stats bar updates to reflect the selected week
- Streak always shows the current (real-time) streak regardless of week selection

### 3.5 Add Button

- **"+ Add Sport"** button (or FAB on mobile)
- Opens the standard trackable creation flow with `trackableType` pre-set to `'sport'`
- Also accessible from: Trackables page (with type selector)

---

## 4. Trackable Creation Flow

### 4.1 Type Selector

The existing trackable creation wizard gets a **Trackable Type selector** at the top:

- Options: **Regular** (default) | **Sport**
- When **Sport** is selected:
  - The `trackableType` flag is set to `'sport'`
  - A validation rule activates: at least one `TIME_ELAPSED` form question must exist before saving
  - If user tries to save without a duration field: show error "Sport trackables require at least one duration (time elapsed) field"

### 4.2 No Templates

- User builds form fields manually, same as regular trackables
- No predefined templates or field suggestions
- Full control over what fields to include beyond the mandatory duration

---

## 5. Dashboard Widget: `SPORT_SUMMARY`

### 5.1 Widget Definition

New `DashboardWidgetType`: `SPORT_SUMMARY`

```
┌──────────────────────────────┐
│  🏋️ Sport This Week      [+] │  ← Title + quick-log button
│                              │
│  3 sessions  2h 45m   🔥 5d │  ← Same 3 stats as Sport page
└──────────────────────────────┘
```

### 5.2 Behavior

| Element | Behavior |
|---------|----------|
| **Title** | "Sport This Week" (or configurable name) |
| **Stats** | Sessions count, total duration, current streak — same calculation as Sport page stats bar, scoped to current week |
| **Quick-log [+]** | Opens a dropdown/modal listing sport trackables. Tapping one opens the form entry modal for that trackable. After logging, widget stats update. |
| **Tap stats area** | Navigates to `/sport` |

### 5.3 Widget Settings

Minimal settings (configurable via dashboard edit mode sidebar):
- **Widget name** (default: "Sport This Week")
- No other configuration needed — stats are always sessions/duration/streak for all sport trackables

### 5.4 Size

- **Minimum**: 2×1 grid units (compact stats row)
- **Default**: 3×1 grid units (comfortable layout)

---

## 6. Navigation

### 6.1 New Nav Item

Add **"Sport"** to both:
- **Desktop sidebar** (NavigationSidebar)
- **Mobile bottom bar**

**Position**: After Trackables, before Journal (logical grouping: Trackables → Sport → Journal)

**Icon**: Dumbbell or running person (FontAwesome `fa-dumbbell` or `fa-person-running`)

### 6.2 Bottom Bar (6 items)

Final order: **Dashboard** | **Trackables** | **Sport** | **Journal** | **Goals** | **Tags**

Accepted trade-off: 6 items on mobile. Modern phones (360px+ width) handle this at ~60px per item.

---

## 7. Streak Calculation Logic

```
function calculateStreak(sportEntries, restDays):
  streak = 0

  // Today is always "in progress" — skip it unless it has activity or rest
  todayHasEntry = sportEntries.any(e => sameDay(e.timestamp, today))
  todayIsRest = restDays.any(r => r.date === formatDate(today))

  if todayHasEntry:
    streak = 1           // Today counts as active
    currentDate = yesterday
  elif todayIsRest:
    currentDate = yesterday  // Today preserves, start counting from yesterday
  else:
    currentDate = yesterday  // Today is pending — don't break, start from yesterday

  // Count backwards from currentDate
  while true:
    hasSportEntry = sportEntries.any(e => sameDay(e.timestamp, currentDate))
    isRestDay = restDays.any(r => r.date === formatDate(currentDate))

    if hasSportEntry:
      streak += 1
      currentDate = previousDay(currentDate)
    elif isRestDay:
      // Preserve streak, don't increment
      currentDate = previousDay(currentDate)
    else:
      break  // Inactive day — streak ends

  return streak
```

**Example**: Today is Thursday, no entry yet. Wed=swim, Tue=rest, Mon=swim, Sun=nothing.
→ Skip today (pending). Wed=+1, Tue=preserve, Mon=+1, Sun=break. **Streak = 2**.

**Edge cases**:
- Multiple sport entries on the same day = counts as 1 toward streak
- Rest day AND sport entry on the same day = counts as active (sport entry takes precedence)
- First day of app usage with no entries = streak is 0
- Today with no entry and no rest day = "pending" — streak counts from yesterday backwards (today never breaks the streak)

---

## 8. Technical Integration Points

### 8.1 Dexie Schema Changes (`client/src/db/dexie/db.ts`)

```typescript
// Bump from version 25 → 26:
// Existing trackables store (id is string, not auto-increment):
trackables: 'id, categoryId, trackableType'  // add trackableType index
restDays: 'id, date'                          // new table, date indexed for uniqueness lookups
```

**Migration function** (in `DexieMigrator`): Iterate all existing `trackables` rows and set `trackableType: 'regular'` via `bulkPut`.

### 8.2 Store / Service Changes

| Layer | Changes |
|-------|---------|
| **TrackableStore** | Add method: `getSportTrackables()` — filters by `trackableType === 'sport'` |
| **TrackableService** | Add validation: sport trackables must have TIME_ELAPSED question |
| **JournalStore** | Add method: `getSportEntries(weekStart, weekEnd)` — **in-memory join**: 1) Get all sport trackable `formId`s from `TrackableStore.getSportTrackables()`, 2) Query journal entries by time range via existing `getEntriesByTimeRange()`, 3) Filter in memory by matching `formId`s. This avoids new collection-level queries and reuses existing journal APIs (`collections.ts` queries by `formId` + `timestamp`). |
| **New: RestDayCollection** | Dexie collection interface (`client/src/db/dexie/restday.ts`) following the `Collections` pattern in `client/src/db/collections.ts` — CRUD + query by date range |
| **New: RestDayStore** | Svelte store wrapping RestDayCollection, registered in `StoreProvider` |
| **New: RestDayService** | Business logic for rest day toggling (idempotent create/delete) |
| **New: SportStreakService** | Streak calculation with rest day awareness |
| **DashboardWidgetStore** | Register `SPORT_SUMMARY` widget type |
| **VariableService** | **No changes for MVP.** Sport stats (sessions, duration, streak) are computed in the **view layer** directly from journal queries + rest day queries. The existing Variable system is not used for sport aggregation in v1 — this avoids dual-math and keeps scope tight. Future enhancement can migrate to variables if needed. |

### 8.3 New Components

| Component | Location |
|-----------|----------|
| `SportView` | `views/sport/SportView.svelte` — main page |
| `SportStatsBar` | `components/sport/SportStatsBar.svelte` |
| `SportActivityList` | `components/sport/SportActivityList.svelte` |
| `SportActivityRow` | `components/sport/SportActivityRow.svelte` |
| `SportWeekNav` | `components/sport/SportWeekNav.svelte` |
| `RestDayToggle` | `components/sport/RestDayToggle.svelte` |
| `SportSummaryWidget` | `components/dashboard/widgets/SportSummaryWidget.svelte` |
| `SportSummaryWidgetSettings` | `components/dashboard/widgets/SportSummaryWidgetSettings.svelte` |
| `SportQuickLog` | `components/sport/SportQuickLog.svelte` — dropdown for widget quick-log |

### 8.4 Empty States

| State | UX |
|-------|-----|
| **No sport trackables** | Sport page shows a "Get Started" card with explanation + "Create your first sport" button (pre-sets `trackableType: 'sport'`) |
| **No entries this week** | Each day shows "No activity" with rest day toggle visible |
| **Quick-log with no sport trackables** | Widget quick-log button shows "Create a sport first" prompt |

### 8.5 Type Switching Rules

- **Regular → Sport**: Allowed only if the trackable has at least one `TIME_ELAPSED` question. Otherwise show validation error.
- **Sport → Regular**: Allowed freely. The trackable disappears from the Sport page but all journal entries remain intact.
- **Removing last TIME_ELAPSED from sport trackable**: Blocked with validation error "Sport trackables require at least one duration field."

### 8.6 Route Addition

```typescript
{ path: '/sport', component: SportView }
```

---

## 9. Scope & Non-Goals

### In Scope (MVP)
- [x] `trackableType` flag on Trackable entity
- [x] Sport page with stats bar, week navigation, activity list
- [x] Rest day toggle with streak preservation
- [x] SPORT_SUMMARY dashboard widget with quick-log
- [x] Sport nav item in sidebar + bottom bar
- [x] Duration (TIME_ELAPSED) mandatory for sport trackables
- [x] Calendar day streak calculation
- [x] Sport trackables visible everywhere (trackables, journal, goals, analytics)

### Not in Scope (Future)
- Per-sport templates or suggested fields
- Personal records / personal bests tracking
- Workout plans or scheduled training programs
- Exercise library or database
- GPS/location tracking integration
- Heart rate or wearable device integration
- Social sharing of workouts
- Per-sport breakdown in stats (e.g., "Swimming: 3 sessions, Running: 2")
- Configurable streak targets (weekly frequency vs daily)
- Sport-specific goal types (beyond reusing existing Goals)
- Filtering sport trackables out of the Trackables page

---

## 10. Open Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | Should "today" break the streak if no sport entry yet? | **Resolved**: No — today is always "in progress." Pseudocode updated in Section 7. |
| 2 | What icon for the Sport nav item? | `fa-dumbbell` (universally recognized fitness icon) |
| 3 | Week start day: Monday or Sunday? | Follow device/browser locale |
| 4 | Should rest days be synced via the sync service? | **Resolved**: Yes — added to `SyncedTable`, last-write-wins conflict resolution. See Section 2.2. |
| 5 | Max rest days per week? | No limit in MVP. User's discretion. |
| 6 | Can a trackable switch between regular and sport? | **Resolved**: Yes, with validation. See Section 8.5. |
| 7 | Data export for sport data? | Explicitly **out of scope** for MVP. Sport entries are journal entries and will be included in any future general export feature. |

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Sport trackables created | ≥1 per active user within first week |
| Sport page visits per week | ≥3 per active user with sport trackables |
| Dashboard widget adoption | ≥50% of users with sport trackables add the widget |
| Streak engagement | Average streak length ≥3 days for active sport users |

---

## 12. Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| 1 | Flag on Trackable vs wrapper entity | Wrapper `SportActivity` entity, hybrid flag+config | Simplest approach; avoids indirection; user prefers single model |
| 2 | No form templates | Predefined templates, smart suggestions | User wants full manual control; existing users know the form system |
| 3 | Common denominator aggregation | Per-sport breakdown, user-configurable metrics | Keep it simple; sessions + duration + streak work across all sports |
| 4 | Duration field mandatory | Optional duration, show N/A | Guarantees stats always have data; small constraint for big reliability |
| 5 | New SPORT_SUMMARY widget type | Reuse METRIC widget with filter | Purpose-built widget gives better UX; quick-log requires custom component |
| 6 | 6 nav items in bottom bar | Move Tags to sidebar, "More" menu | User accepts the trade-off; modern phones handle 6 items |
| 7 | Rest day preserves streak | Rest day counts as active, max rest days | Preserving without incrementing is the most intuitive behavior |
| 8 | Rest day via toggle on Sport page | System tag, rest trackable | Toggle is simplest UX; no need for full trackable/tag infrastructure |
| 9 | Show sport trackables everywhere | Filter from Trackables page | Full system citizens; no hidden behavior |
| 10 | Calendar day streak | Weekly frequency, configurable target | Simplest to understand and implement; can enhance later |

---

## 13. Cross-AI Validation

| Reviewer | Model | Verdict | Issues |
|----------|-------|---------|--------|
| **Gemini** | Gemini 3.1 Pro | **PASS** | 3 MINOR |
| **Cursor** | Composer 2 (Kimi K2.5) | **FAIL** | 1 CRITICAL, 7 MAJOR, 6 MINOR |
| **Codex** | GPT-5.4 | **FAIL** | 3 HIGH, 3 MEDIUM |

### Issues Addressed

| # | Source | Severity | Issue | Resolution |
|---|--------|----------|-------|------------|
| 1 | Cursor | CRITICAL | Streak pseudocode contradicts "today is pending" rule | **Fixed** — Section 7 rewritten with explicit today-handling step + worked example |
| 2 | Cursor | MAJOR | Wrong schema file reference (`DexieDatabase.ts` → `db/dexie/db.ts`) | **Fixed** — Section 8.1 corrected to real file path |
| 3 | Cursor | MAJOR | Wrong key format (`++id` → `id` for string keys) | **Fixed** — Section 8.1 matches actual Dexie store format |
| 4 | Cursor | MAJOR | "No migration needed" understates work | **Fixed** — Section 2.1 now specifies DexieMigrator bulkPut + read-layer default |
| 5 | Cursor/Gemini | MAJOR | Multiple TIME_ELAPSED fields — sum behavior unspecified | **Fixed** — Section 3.2 explicitly states "all are summed" |
| 6 | Cursor | MAJOR | RestDay uniqueness/timezone/sync not specified | **Fixed** — Section 2.2 now has uniqueness, timezone, and sync conflict rules |
| 7 | Cursor | MAJOR | VariableService left as "may need" fork | **Fixed** — Section 8.2 decides: view-layer only for MVP |
| 8 | Cursor | MAJOR | Sync for RestDay not decomposed | **Fixed** — Section 2.2 specifies SyncedTable + last-write-wins |
| 9 | Cursor | MINOR | Type switching paths unspecified | **Fixed** — Section 8.5 added |
| 10 | Gemini | MINOR | Empty states undefined | **Fixed** — Section 8.4 added |
| 11 | Gemini | MINOR | Streak "today" ambiguity in UI | **Fixed** — pseudocode + example clarify behavior |
| 12 | Codex | MEDIUM | Scope framed as "UX only" but touches model/schema/sync/widgets | **Fixed** — Section 1 rewritten to accurately scope the change surface |
| 13 | Codex | MEDIUM | Query strategy for `getSportEntries()` unspecified | **Fixed** — Section 8.2 now specifies in-memory join via formId matching |
| 14 | Codex | HIGH | RestDay persistence inconsistent ("table or key-value store") | **Fixed** — Section 2.2 locks to Dexie table + RestDayCollection |
| 15 | Codex | MEDIUM | Missing RestDayCollection in collections pattern | **Fixed** — Section 8.2 now includes RestDayCollection following `collections.ts` pattern |

### Consolidated Verdict: **PASS** (after fixes applied above)

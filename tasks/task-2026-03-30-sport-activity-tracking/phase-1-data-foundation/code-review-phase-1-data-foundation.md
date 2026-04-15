# Code Review - Phase 1 Data Foundation

**Date**: 2026-04-14 | **Reviewer**: AI Code Reviewer | **Status**: NEEDS FIXES

<!-- SECTION:review-context -->
## Review Context

- **Mode**: task
- **Target**: tasks/task-2026-03-30-sport-activity-tracking/phase-1-data-foundation
- **Base**: main (21243a4)
- **Head**: 385b1a1
- **Scope**: full
- **Spec Available**: yes
- **Immutable Snapshot**: yes
- **Untracked Files**: none (all committed)

<!-- /SECTION:review-context -->

---

<!-- SECTION:summary -->
## Reviewer Note

This PR adds the complete data foundation for sport activity tracking: a `TrackableType` discriminator on the Trackable model, a full RestDay CRUD stack (model -> collection -> service -> store), sport streak calculation with rest-day awareness, weekly stats aggregation, and sport trackable validation. The architecture is excellent -- it faithfully follows existing Collection->Service->Store patterns and introduces clean, testable pure-computation services. Spec compliance is 13/13 with all 34 test plan cases implemented. However, there is one blocking issue: adding `trackableType` as required to the `Trackable` type breaks `suggestions.ts` (TypeScript compile error). A secondary concern is `getSportEntries` using sequential queries with the wrong index instead of the existing compound-index method.

<!-- /SECTION:summary -->

---

<!-- SECTION:verdict -->
## Verdict

### NEEDS FIXES

**1 major blocking issue** must be resolved before merge: the TypeScript compile error in `suggestions.ts:103`. The `getSportEntries` performance issue is also major but non-blocking for a data-foundation PR. Fix both majors, then this is ready for re-review.

**Next action**: Fix the two major issues, then re-run `/sr`.

<!-- /SECTION:verdict -->

---

<!-- SECTION:key-findings -->
## Key Findings

### Major

1. **TypeScript compile error in `suggestions.ts:103`** — Adding `trackableType` as required to `Trackable` breaks `parseTrackableSuggestion` which constructs a Trackable without it. **Fix**: Add `trackableType: 'regular'` to the object literal. *(architecture, code-quality)*

2. **`getSportEntries` uses sequential queries with wrong index** — Loops over sport form IDs with sequential `await` calls to `getEntriesByFormIdFromTime` (timestamp-only index), then filters `endTimestamp` in JS. Should use `getEntriesByFormIdAndTimeRange` (compound `[formId+timestamp]` index) with `Promise.all`. Also has unused `sportFormIdSet` variable. *(performance, code-quality)*

### Minor

3. **Unbounded backward loop in streak calculation** — `while(true)` with no safety cap could hang the UI on pathological data. Add `MAX_LOOKBACK_DAYS = 365`. *(performance, security, architecture)*

4. **UTC/local timezone inconsistency** — `toDateString()` uses UTC via `toISOString()`, but `addDays()` uses local timezone via `setDate()`. Could cause off-by-one near UTC boundary. *(architecture)*

5. **Untested `unwrapDisplayValue` DISPLAY branch** — Stats tests always use `pNumber()` directly; the DISPLAY wrapper path is never exercised. *(test-coverage)*

6. **`RestDayStore.load()` never called** — Store starts empty and only updates via observer callbacks. Existing rest days won't appear until a toggle occurs. *(architecture)*

7. **`notifyObservers` is public** — Exposes internal notification mechanism; other services keep this private. *(code-quality)*

8. **Redundant condition in streak branching** — All three branches set `current = addDays(today, -1)`; can simplify to a single check. *(code-quality)*

<!-- /SECTION:key-findings -->

---

<!-- SECTION:coverage -->
## Review Coverage

- **Diff Reviewed**: 23 files, +1513/-6 lines (full diff main...385b1a1)
- **Spec Used**: tech-decomposition-phase-1-data-foundation.md (13 acceptance criteria, 34 test plan cases)
- **Verification Run**: vitest (139/139 pass), tsc (1 new error in suggestions.ts, 7 pre-existing errors)
- **Review Limits**: Documentation reviewer did not complete; all other 5 domain reviewers completed successfully

<!-- /SECTION:coverage -->

---

## Domain Findings

<!-- SECTION:quality-gate -->
### Verification Gate

**Tests**: `npx vitest run` — 139/139 passed (24 test files, 36 new sport tests)
**TypeScript**: `npx tsc --noEmit -p tsconfig.app.json` — 1 NEW error introduced (suggestions.ts:103 missing trackableType), 7 pre-existing errors unrelated to this PR

<!-- /SECTION:quality-gate -->

---

<!-- SECTION:spec-compliance -->
### Spec Compliance

**Agent**: `spec-compliance-reviewer`

**Status**: COMPLIANT

#### Requirements Verification

| # | Acceptance Criterion | Status | Evidence | Notes |
|---|---------------------|--------|----------|-------|
| 1 | Trackable entity has trackableType: 'regular' or 'sport' field; existing trackables default to 'regular' | IMPLEMENTED | `client/src/model/trackable/trackable.ts:11,23` | TrackableType union type defined, field added to base Trackable object before TrackableCardSettings intersection -- exactly as specified |
| 2 | Dexie schema bumped to v26 with migration setting trackableType: 'regular' on all existing rows | IMPLEMENTED | `client/src/db/dexie/db.ts:66-89`, `client/src/db/migration/migrations/trackableType.ts:1-18`, `client/src/db/migration/migration.ts:8` | Schema v26 with trackableType index on trackables and restDays table. Migration uses trackableType ?? 'regular' via DexieMigrator pattern (not Dexie .upgrade()). Migration registered at version 4 in MIGRATIONS array. |
| 3 | RestDay entity exists as first-class Dexie table with sync support | IMPLEMENTED | `client/src/model/sport/restday.ts:1-5`, `client/src/db/dexie/db.ts:61,88,128` | RestDay {id, date, timestamp} interface. Dexie table restDays: "id, date". Uses SyncedTable wrapper for sync support. |
| 4 | Rest day toggling is idempotent (toggle ON twice = one record, toggle OFF on missing = no-op) | IMPLEMENTED | `client/src/services/sport/restday.ts:13-26` | toggle() checks if record exists: if yes delete, if no create. Idempotent by design. Test TP-2.3 verifies. Toggle OFF on missing is no-op because deleteRestDayByDate checks existence first. |
| 5 | Sport trackable creation enforces at least one TIME_ELAPSED form question | IMPLEMENTED | `client/src/services/trackable/trackable.ts:126-129,366-378` | validateSportTrackable() checks form.questions.some(q => q.dataType === FormQuestionDataType.TIME_ELAPSED). Called in createTrackable() before persistence. Error message matches spec exactly. |
| 6 | Type switching validation: regular->sport requires TIME_ELAPSED; sport->regular always allowed | IMPLEMENTED | `client/src/services/trackable/trackable.ts:182-188,366-378` | updateTrackable() calls validateSportTrackable() on the new type. Since validation only fires when trackableType === 'sport', sport->regular always passes. Tests TP-5.1 through TP-5.4 verify all paths. |
| 7 | getSportTrackables() filter returns only sport-typed trackables | IMPLEMENTED | `client/src/stores/trackable/trackable.svelte.ts:180-183` | Filters by (t.trackableType ?? 'regular') === 'sport' with read-layer safety net. |
| 8 | getSportEntries() returns journal entries scoped to sport trackable formIds | IMPLEMENTED | `client/src/stores/journal/entry.ts:46-54` | Queries per-formId using getEntriesByFormIdFromTime, filters by endTimestamp, accumulates results. |
| 9 | SportStreakService correctly implements streak algorithm with rest day preservation and today pending logic | IMPLEMENTED | `client/src/services/sport/streak.ts:14-69` | Algorithm matches spec pseudocode: today has entry -> streak=1 walk from yesterday; today is rest -> walk from yesterday; else today pending walk from yesterday. Backward walk: entry +1, rest preserve, neither break. All 10 streak test cases pass. |
| 10 | SportStatsService computes session count, duration aggregation (sum all TIME_ELAPSED fields), and formats as Xh Ym | IMPLEMENTED | `client/src/services/sport/stats.ts:31-88` | computeWeekStats() filters entries to week range, counts sessions, builds formId->TIME_ELAPSED question map, sums values. formatDuration() always returns Xh Ym format. Handles DISPLAY-wrapped values via unwrapDisplayValue(). |
| 11 | Read-layer uses trackableType ?? 'regular' as safety net for unmigrated rows | IMPLEMENTED | `client/src/stores/trackable/trackable.svelte.ts:182`, `client/src/services/trackable/trackable.ts:184` | Both getSportTrackables() and updateTrackable() use ?? 'regular' fallback. Migration also uses ?? 'regular'. |
| 12 | All existing tests continue to pass | IMPLEMENTED | Spec success criteria | No existing test files were modified in ways that would break them. |
| 13 | New unit tests cover streak, rest day toggling, duration aggregation, type validation, filtering, and edge cases | IMPLEMENTED | 5 test files, 33 test cases | All test cases from spec TP-1 through TP-7.5 are present and correctly implemented. |

**Coverage**: 13/13 criteria fully implemented

#### Test Plan Verification

| Test Plan ID | Status | File |
|---|---|---|
| TP-1.1 Basic streak counting | IMPLEMENTED | `streak.test.ts:22` |
| TP-1.2 Streak breaks on inactive day | IMPLEMENTED | `streak.test.ts:33` |
| TP-1.3 Rest day preserves streak | IMPLEMENTED | `streak.test.ts:45` |
| TP-1.4 Today pending | IMPLEMENTED | `streak.test.ts:56` |
| TP-1.5 Today with entry | IMPLEMENTED | `streak.test.ts:69` |
| TP-1.6 Today is rest day | IMPLEMENTED | `streak.test.ts:80` |
| TP-1.7 Multiple entries same day | IMPLEMENTED | `streak.test.ts:91` |
| TP-1.8 Sport entry takes precedence over rest | IMPLEMENTED | `streak.test.ts:102` |
| TP-1.9 Empty history | IMPLEMENTED | `streak.test.ts:113` |
| TP-1.10 All rest days no entries | IMPLEMENTED | `streak.test.ts:119` |
| TP-2.1 Toggle ON creates record | IMPLEMENTED | `restday.test.ts:6` |
| TP-2.2 Toggle OFF deletes record | IMPLEMENTED | `restday.test.ts:17` |
| TP-2.3 Toggle ON is idempotent | IMPLEMENTED | `restday.test.ts:30` |
| TP-2.4 Query by date range | IMPLEMENTED | `restday.test.ts:47` |
| TP-3.1 Session count | IMPLEMENTED | `stats.test.ts:59` |
| TP-3.2 Duration sums TIME_ELAPSED fields | IMPLEMENTED | `stats.test.ts:75` |
| TP-3.3 Duration across entries | IMPLEMENTED | `stats.test.ts:91` |
| TP-3.4 Zero entries | IMPLEMENTED | `stats.test.ts:107` |
| TP-3.5 Duration format Xh Ym | IMPLEMENTED | `stats.test.ts:119` |
| TP-4.1 Sport without TIME_ELAPSED fails | IMPLEMENTED | `validation.test.ts:27` |
| TP-4.2 Sport with TIME_ELAPSED passes | IMPLEMENTED | `validation.test.ts:34` |
| TP-4.3 Regular no requirement | IMPLEMENTED | `validation.test.ts:41` |
| TP-5.1 Regular->Sport with TIME_ELAPSED | IMPLEMENTED | `validation.test.ts:48` |
| TP-5.2 Regular->Sport without TIME_ELAPSED blocked | IMPLEMENTED | `validation.test.ts:55` |
| TP-5.3 Sport->Regular always allowed | IMPLEMENTED | `validation.test.ts:62` |
| TP-5.4 Removing last TIME_ELAPSED blocked | IMPLEMENTED | `validation.test.ts:69` |
| TP-6.1 Existing trackables receive regular | IMPLEMENTED | `validation.test.ts:76` |
| TP-6.2 RestDay table created | IMPLEMENTED | `validation.test.ts:96` + `db.ts:88` |
| TP-7.1 getSportTrackables only sport | IMPLEMENTED | `filtering.test.ts:22` |
| TP-7.2 getSportEntries by formIds | IMPLEMENTED | `filtering.test.ts:35` |
| TP-7.5.1 Zero-duration TIME_ELAPSED | IMPLEMENTED | `stats.test.ts:127` |
| TP-7.5.2 Very large duration | IMPLEMENTED | `stats.test.ts:143` |
| TP-7.5.3 Empty database | IMPLEMENTED | `filtering.test.ts:50` |
| TP-7.5.4 Streak independent of week start | IMPLEMENTED | `streak.test.ts:130` |

#### Extra Work (not in spec)

| File | Change | Justification |
|------|--------|---------------|
| `client/src/services/sport/stats.ts:16-21` | unwrapDisplayValue() helper for DISPLAY-wrapped primitives | JUSTIFIED -- existing codebase wraps TIME_ELAPSED answers in DISPLAY type; without this duration sums would silently return 0 |
| `client/src/services/sport/restday.ts:38-53` | getRestDays(), notifyObservers() public methods beyond spec interface | JUSTIFIED -- getRestDays() needed by RestDayStore for load(); notifyObservers() needed for sync observer pattern |
| `client/tests/sport/validation.test.ts:86-93` | Extra test verifying migration preserves existing trackableType | JUSTIFIED -- valuable edge case ensuring migration doesn't overwrite sport trackables |
| `client/tests/sport/filtering.test.ts:57-77` | Extra test for read-layer safety (trackableType ?? 'regular') | JUSTIFIED -- directly tests acceptance criterion 11 |
| `client/src/stores/journal/entry.ts:47` | sportFormIdSet variable declared but unused | UNJUSTIFIED -- dead code; Set created but filtering done via per-formId loop instead |

#### Issues

- [MINOR] **Dead code**: `client/src/stores/journal/entry.ts:47` -- `sportFormIdSet` is declared but never used. The method works correctly by iterating `sportFormIds` array directly, but the unused Set should be removed.

<!-- /SECTION:spec-compliance -->

---

<!-- SECTION:approach-review -->
### Approach Review

**Agent**: `senior-architecture-reviewer` | **Status**: MINOR_ADJUSTMENTS

#### Requirements Check

| Requirement | Status | Notes |
|-------------|--------|-------|
| TrackableType discriminator on Trackable | DONE | `trackableType: TrackableType` added to base object type correctly |
| Dexie schema v25->v26 with migration | DONE | Schema bumped, `trackableType` index added, `restDays` table created |
| Data migration sets existing trackables to 'regular' | DONE | `TrackableTypeMigration` applies `trackableType ?? 'regular'` via `DexieMigrator` pattern |
| RestDay model + full CRUD stack | DONE | Model -> Collection -> Service -> Store chain follows existing patterns exactly |
| Rest day idempotent toggle | DONE | `toggle()` checks existence before create/delete |
| Sport trackable TIME_ELAPSED validation | DONE | `validateSportTrackable()` checks on both create and update paths |
| getSportTrackables filter | DONE | Added to `TrackableStore` with defensive `?? 'regular'` |
| getSportEntries scoped query | DONE | Added to `JournalEntryStore` using `getEntriesByFormIdFromTime` |
| Sport streak calculation | DONE | Backward walk algorithm with rest-day preservation and today-pending logic |
| Sport weekly stats | DONE | Session count + TIME_ELAPSED duration summing with DISPLAY value unwrapping |
| Read-layer safety `?? 'regular'` | DONE | Applied in `TrackableStore.getSportTrackables()` and `TrackableService.updateTrackable()` |
| Sync observer for restDays | DONE | Wired in `StoreProvider.setup()` matching existing pattern |

#### TDD Compliance

**Score**: 0/12 | **Status**: VIOLATIONS_FOUND

| Criterion | Test Commit | Impl Commit | Order | Status |
|-----------|-------------|-------------|-------|--------|
| All criteria | N/A | 385b1a1 | VIOLATION | All tests and implementation shipped in a single commit |

All tests and implementation code were delivered in a single commit (`385b1a1`). There is no evidence of TDD being practiced -- no separate test-first commits exist. This is a minor TDD violation given that the tests are comprehensive and correct, but it violates the test-before-implementation principle.

#### Solution Assessment

| Metric | Score | Notes |
|--------|-------|-------|
| Approach Quality | 8/10 | Clean, correct solution that follows existing patterns faithfully. Good separation of pure computation (streak, stats) from side-effecting services (RestDayService). |
| Architecture Fit | 9/10 | Excellent pattern adherence: Collection -> Service -> Store chain matches GoalService/GoalStore exactly. Migration uses DexieMigrator, not Dexie `.upgrade()`. Sync observers wired properly. |
| Best Practices | 7/10 | Defensive read-layer safety is good. One confirmed TypeScript compile error. Minor issue with unused variable in getSportEntries. Migration version numbering is clean (3->4). |

#### Issues

- [MAJOR] **TypeScript compile error from missing `trackableType` in `parseTrackableSuggestion`**: Adding `trackableType` as required to the `Trackable` type breaks `client/src/model/trackable/suggestions.ts:103` where `parseTrackableSuggestion` constructs a `Trackable` object literal without providing `trackableType`. This is a confirmed type-safety regression that will cause `tsc --noEmit` to fail.
  - Location: `client/src/model/trackable/suggestions.ts:103`
  - Solution: Add `trackableType: 'regular'` to the object literal in `parseTrackableSuggestion`, e.g.: `trackableType: 'regular' as TrackableType,` after the `dependencies: {},` line.

- [MINOR] **Unused variable in `getSportEntries`**: `client/src/stores/journal/entry.ts:47` creates `sportFormIdSet = new Set(sportFormIds)` but never uses it -- the iteration uses the original `sportFormIds` array. The Set was likely intended for O(1) lookup but the filtering approach changed. Remove the unused variable.
  - Location: `client/src/stores/journal/entry.ts:47`
  - Solution: Delete the line `let sportFormIdSet = new Set(sportFormIds);`

- [MINOR] **Streak algorithm has no upper bound on backward walk**: `client/src/services/sport/streak.ts:49` uses `while (true)` with no maximum iteration limit. For a user with years of continuous activity + rest days and no gaps, this could walk back thousands of days. In practice this is unlikely to be a real problem since a gap will eventually break the streak, but it is worth noting for robustness.
  - Location: `client/src/services/sport/streak.ts:49`
  - Suggestion: Consider adding a guard like `const MAX_LOOKBACK = 365 * 3;` to prevent degenerate cases, or accept as-is since real data will always have a gap.

- [MINOR] **`toDateString` uses UTC-based ISO split, but `addDays` uses local timezone**: `client/src/services/sport/streak.ts:4-11` -- `toDateString` extracts `YYYY-MM-DD` from `toISOString()` which is UTC, while `setDate`/`getDate` in `addDays` operates in local timezone. For users near the UTC boundary (e.g., UTC+12 or UTC-12), a local "Monday" could map to a different UTC date, causing incorrect streak calculations. This is an edge case but architecturally inconsistent.
  - Location: `client/src/services/sport/streak.ts:4-11`
  - Suggestion: Use a consistent timezone approach. Since `JournalEntry.timestamp` is epoch-based and the rest of the app appears to use local time, consider using a local date formatter instead of `toISOString().split('T')[0]`.

- [INFO] **`RestDayStore.load()` is never called**: The `RestDayStore` has a `load()` method that fetches all rest days from the service, but it is not called during `StoreProvider.setup()`. The store starts with an empty resolved promise `[]` and only updates via observer callbacks. This means if the app starts with existing rest days in the database, they will not appear in the store until a toggle occurs. This may be intentional if rest days are loaded lazily elsewhere in Phase 2, but worth flagging.
  - Location: `client/src/stores/sport/restday.svelte.ts:20-22` and `client/src/stores.ts:195`
  - Suggestion: Either call `restDays.load()` in `StoreProvider.setup()` (matching the pattern used by other stores), or document that lazy loading is intentional for Phase 2.

#### Positive Observations

- **Excellent pattern adherence**: The RestDay entity stack (model -> collection interface -> Dexie implementation -> service -> store) is an exact structural match of the existing GoalService/GoalStore pattern, including `EntityObservers`, `SyncedTable` wrapping, and sync observer registration. This will be immediately familiar to any developer on the project.
- **Pure computation services**: `SportStreakService` and `SportStatsService` accept data as arguments with no side effects, making them trivially testable and reusable. This was a good architectural decision.
- **Validation as a free function**: `validateSportTrackable()` is exported as a standalone function, making it reusable in tests and other contexts without needing a service instance.
- **DISPLAY value unwrapping**: The `unwrapDisplayValue` helper in stats.ts correctly handles the project's `PrimitiveValue` wrapper pattern, showing good understanding of the existing data model.

<!-- /SECTION:approach-review -->

---

<!-- SECTION:security -->
### Security

**Agent**: `security-code-reviewer`

- [MINOR] **No input validation on `date` parameter in RestDayService**: The `toggle()`, `isRestDay()`, and `getRestDaysInRange()` methods accept raw `string` parameters for dates without validating format (expected `YYYY-MM-DD`). While this is a client-side-only, local-storage application (IndexedDB via Dexie) with no server-side attack surface, malformed date strings could cause incorrect Dexie range queries in `getRestDaysByDateRange()` (lexicographic comparison on non-date strings) and inconsistent data in the local store. The `toDateString()` helper in `streak.ts` produces `YYYY-MM-DD` via `toISOString().split('T')[0]`, but callers of `RestDayService` are not guaranteed to use that format.
  - Location: `client/src/services/sport/restday.ts:13`, `client/src/services/sport/restday.ts:29`, `client/src/services/sport/restday.ts:34`
  - Suggestion: Add a lightweight date-format guard (e.g., regex `/^\d{4}-\d{2}-\d{2}$/`) at the service boundary to reject malformed dates early and maintain data integrity in IndexedDB.

- [MINOR] **Unbounded backward walk in streak calculation**: `SportStreakService.calculateStreak()` walks backwards day-by-day in a `while(true)` loop with no upper bound. If the data contains a long unbroken chain of rest days (e.g., hundreds of entries without a gap), this loop runs for each day. In a client-side context this is unlikely to cause a security issue (no DoS vector since it is the user's own data), but it could freeze the UI thread.
  - Location: `client/src/services/sport/streak.ts:49-66`
  - Suggestion: Add a reasonable maximum iteration guard (e.g., 365 or 730 days) to prevent UI hangs on pathological data.

- [INFO] **Good: `crypto.randomUUID()` for ID generation**: Rest day IDs and trackable IDs use the Web Crypto API (`crypto.randomUUID()`), which produces cryptographically random UUIDs. This is the correct choice -- no predictable ID concerns.

- [INFO] **Good: Dexie parameterized queries**: All IndexedDB operations in `DexieRestDayCollection` use Dexie's structured query API (`.where().equals()`, `.where().between()`) rather than string interpolation. No injection risk.

- [INFO] **Good: Validation gate on sport trackable creation**: The `validateSportTrackable()` function enforces the `TIME_ELAPSED` field requirement at both create and update paths (`createTrackable` line 127, `updateTrackable` line 185), preventing invalid sport trackables from being persisted.

- [INFO] **Good: No sensitive data exposure**: The new model (`RestDay`) contains only an ID, a date string, and a timestamp. No PII, credentials, or secrets are involved in any of the changed code paths.

<!-- /SECTION:security -->

---

<!-- SECTION:code-quality -->
### Code Quality

**Agent**: `code-quality-reviewer`

- [MAJOR] **Missing `trackableType` in `parseTrackableSuggestion` causes compile error**: The `Trackable` type now requires `trackableType: TrackableType`, but `parseTrackableSuggestion` constructs a `Trackable` object without it. This will cause a TypeScript compile error.
  - Location: `client/src/model/trackable/suggestions.ts:103-113`
  - Suggestion: Add `trackableType: 'regular'` to the object literal at line 103. All suggestion-created trackables are regular by default, so this aligns with the migration's fallback.

- [MAJOR] **Dead variable `sportFormIdSet` never used**: `getSportEntries` creates a `Set` from `sportFormIds` that is immediately abandoned -- the loop iterates over the original array instead. This is dead code that suggests an incomplete refactor (the Set was likely intended for O(1) membership checks but was never wired in).
  - Location: `client/src/stores/journal/entry.ts:47`
  - Suggestion: Remove `let sportFormIdSet = new Set(sportFormIds);` entirely. The current loop-based approach iterates `sportFormIds` directly and is correct; the Set serves no purpose.

- [MINOR] **Redundant condition in streak calculation**: The `else if` branch checks `!entryDates.has(todayStr)`, but this condition is always true at that point because the preceding `if` already tested `entryDates.has(todayStr)` and was false. Additionally, all three branches set `current = addDays(today, -1)` -- the only difference is the first branch also sets `streak = 1`. The branching can be simplified.
  - Location: `client/src/services/sport/streak.ts:36-45`
  - Suggestion: Simplify to:
    ```typescript
    if (entryDates.has(todayStr)) {
        streak = 1;
    }
    let current = addDays(today, -1);
    ```
    The rest-day-today case naturally falls through (streak stays 0, walk starts from yesterday), which is the same behavior as the current three-branch version.

- [MINOR] **Unsafe type assertion in `unwrapDisplayValue`**: The function casts `value.value` to `{value: PrimitiveValue}` without a runtime guard. If the `DISPLAY` variant's internal shape ever changes or arrives malformed, this will throw at runtime with an opaque error.
  - Location: `client/src/services/sport/stats.ts:17-19`
  - Suggestion: Add a defensive check before accessing the nested value, or define a proper `DisplayPrimitiveValue` type with a type guard. At minimum, document the expected shape with a comment referencing where `DISPLAY` values are constructed.

- [MINOR] **`notifyObservers` is public but serves no external purpose**: `RestDayService.notifyObservers` exposes an internal notification mechanism as a public method. Other services in the codebase (e.g., `TrackableService`) keep observer notification private and only trigger it as a side effect of state-changing operations. Exposing it publicly allows callers to fire spurious notifications without any state change.
  - Location: `client/src/services/sport/restday.ts:50-52`
  - Suggestion: Remove the `notifyObservers` method unless there is a concrete external caller. If it is needed for sync/import scenarios, add a comment explaining the use case.

- [INFO] **Codebase convention consistency**: The new code consistently uses `let` for all local variables, matching the existing codebase convention where `let` is strongly preferred over `const` even for non-reassigned bindings. Naming is descriptive and consistent (`sportEntries`, `restDays`, `weekEntries`, `totalDurationMs`). No style deviations detected.

- [INFO] **Well-structured service layering**: The separation of `SportStreakService` (pure algorithm), `SportStatsService` (orchestration/aggregation), and `RestDayService` (CRUD + observer pattern) is clean. Each class has a single clear responsibility. The streak service is stateless and easily testable. The Dexie collection follows the established repository pattern with proper interface abstraction. The migration is minimal and correct with a safe `??` fallback. Good work.

<!-- /SECTION:code-quality -->

---

<!-- SECTION:test-coverage -->
### Test Coverage

**Agent**: `test-coverage-reviewer`

**Summary**: 36 new tests across 5 test files covering the three core services (`SportStreakService`, `SportStatsService`, `RestDayService`), validation logic, migration, and filtering. Test quality is generally high -- clear naming with TP-reference IDs, good arrange-act-assert structure, effective use of test doubles, and thorough scenario coverage for the core algorithms. Two meaningful coverage gaps exist in untested production code paths.

- [MAJOR] **Coverage gap: `unwrapDisplayValue` branch in `SportStatsService.computeWeekStats` is untested**
  - File: `client/src/services/sport/stats.ts:16-21`
  - The `computeWeekStats` method calls `unwrapDisplayValue()` which has a branch for `PrimitiveValueType.DISPLAY` that unwraps nested values before summing durations. All stats tests use `pNumber()` directly, so the DISPLAY wrapper path (lines 17-19) is never exercised. In production, TIME_ELAPSED fields stored via the variable system may arrive as DISPLAY-wrapped values.
  - Suggestion: Add a test in `stats.test.ts` that creates an entry with a `pDisplay(pNumber(900000), pNull())` answer and verifies it is correctly unwrapped and summed into `totalDurationMs`.

- [MAJOR] **Coverage gap: `getSportEntries` in `JournalEntryStore` has no test**
  - File: `client/src/stores/journal/entry.ts:46-54`
  - This is a new method added in this PR that filters journal entries by sport form IDs and time range. It contains filtering logic (iterating sport form IDs, querying per-form, filtering by `endTimestamp`) that is not covered by any test. The filtering test in `filtering.test.ts` reimplements filter logic inline rather than exercising this actual method. Additionally, `sportFormIdSet` on line 47 is constructed but never used (dead code -- cross-ref to code-quality reviewer).
  - Suggestion: Add a unit test that constructs a `JournalEntryStore` with a mock `JournalService`, calls `getSportEntries` with multiple sport form IDs and a time range, and verifies only the correct entries are returned.

- [MINOR] **Coverage gap: `RestDayService` observer notifications are not verified**
  - File: `client/src/services/sport/restday.ts:17,23,42-53`
  - The `toggle` method calls `this.observers.notifyObservers()` on both create (line 17) and delete (line 23) paths. No test verifies that observers are actually invoked. The `addObserver`, `removeObserver`, and `notifyObservers` public methods are also untested.
  - Suggestion: Add a test that registers an observer via `addObserver(EntityObserverType.CREATED, callback)`, toggles a rest day on, and asserts the callback was invoked with the correct `RestDay` object. Similarly for `DELETED`.

- [MINOR] **Edge case: streak with multiple consecutive rest days bridging sport entries**
  - File: `client/src/services/sport/streak.ts:49-66`
  - The backward-walking loop continues through multiple consecutive rest days without entries. While TP-1.3 tests a single rest day bridge and TP-1.10 tests all-rest-days, there is no test for the scenario where multiple consecutive rest days bridge two active days (e.g., sport on Mon, rest on Tue+Wed, sport on Thu).
  - Suggestion: Add a test: entries on Mon and Thu, rest days on Tue and Wed, verify streak is 2 on Thu.

- [MINOR] **Filtering tests validate concept, not production code**
  - File: `client/tests/sport/filtering.test.ts:29,47`
  - Tests TP-7.1 and TP-7.2 reimplement filtering inline (`trackables.filter(t => (t.trackableType ?? 'regular') === 'sport')`) rather than importing production functions. These tests validate the filtering pattern but would not catch a bug if the actual production code used a different filter expression.
  - Suggestion: If sport filtering is extracted to a reusable function, import and test it directly. If it remains inline in UI/store code, consider documenting these as "pattern validation tests."

- [MINOR] **`RestDayStore` (Svelte reactive store) has no test**
  - File: `client/src/stores/sport/restday.svelte.ts`
  - The store wires `RestDayService` observer callbacks to Svelte reactive state (`onRestDayCreated`, `onRestDayDeleted`, `load`). While the underlying service is well-tested, the store's observer registration and state update logic are untested.
  - Suggestion: Acceptable for Phase 1 as thin glue code. Consider adding tests if the store grows in complexity.

- [INFO] **Positive: `DummyRestDayCollection` test double is well-implemented** -- Correctly implements all `RestDayCollection` interface methods with in-memory storage, uses proper string comparison for date range filtering, and follows the same pattern as existing project test doubles. Clean, maintainable approach.

- [INFO] **Positive: Streak tests are comprehensive and well-structured** -- 10 tests cover all key scenarios systematically (consecutive days, gaps, rest days, today-pending, today-with-entry, today-as-rest-day, duplicates, rest+entry same day, empty history, all-rest-days). Helper functions reduce boilerplate. Each test has a TP-reference ID.

- [INFO] **Positive: Migration tests verify both behavior and metadata** -- Tests TP-6.1, TP-6.1b, and TP-6.2 cover the migration's `apply()` for both undefined and pre-existing `trackableType`, plus verify entity type and version number. Thorough for a simple migration.

<!-- /SECTION:test-coverage -->

---

<!-- SECTION:documentation -->
### Documentation

**Agent**: `documentation-accuracy-reviewer`

*Skipped — documentation-accuracy-reviewer did not complete. No API documentation changes in this PR (data-layer-only changes).*

<!-- /SECTION:documentation -->

---

<!-- SECTION:performance -->
### Performance

**Agent**: `performance-reviewer`

- [MAJOR] **Sequential DB queries + suboptimal index usage in `getSportEntries`**: The method loops over `sportFormIds` with sequential `await` calls to `getEntriesByFormIdFromTime`, which itself uses `where("timestamp").aboveOrEqual(start).and(v => v.formId == formId)` -- scanning ALL entries from `startTimestamp` onward and filtering `formId` in JavaScript. There is already a `getEntriesByFormIdAndTimeRange` method that uses the compound index `[formId+timestamp]` and accepts both start/end bounds, which would be significantly more efficient.
  - Location: `client/src/stores/journal/entry.ts:46-54` (sequential loop), `client/src/db/dexie/journal.ts:24-28` (index miss)
  - Impact: With N sport form IDs, this produces N sequential IndexedDB transactions, each scanning entries by timestamp only (no compound index). Data fetched is also unbounded on the upper end, requiring JS filtering for `endTimestamp`. For users with many entries and multiple sport trackables, this compounds into unnecessary I/O and memory allocation.
  - Suggestion: Use `getEntriesByFormIdAndTimeRange(formId, startTimestamp, endTimestamp)` (which leverages the `[formId+timestamp]` compound index) and parallelize with `Promise.all`:
    ```typescript
    // Before (sequential, open-ended, wrong index)
    for (let formId of sportFormIds) {
        let entries = await this.journalService.getEntriesByFormIdFromTime(formId, startTimestamp);
        allEntries.push(...entries.filter(e => e.timestamp <= endTimestamp));
    }

    // After (parallel, bounded, compound index)
    let results = await Promise.all(
        sportFormIds.map(formId =>
            this.journalService.getEntriesByFormIdAndTimeRange(formId, startTimestamp, endTimestamp)
        )
    );
    let allEntries = results.flat();
    ```

- [MAJOR] **Unbounded backward loop in streak calculation -- no safety cap**: The `while (true)` loop in `calculateStreak` walks backwards one day at a time with no maximum iteration limit. If a user has rest days stretching far into the past (e.g., imported data, or a bug inserting rest days with old dates), this loop could iterate thousands of times or effectively hang the UI thread.
  - Location: `client/src/services/sport/streak.ts:49-63`
  - Impact: In the worst case (rest days spanning years with no gap), the loop runs for thousands of iterations, each creating a new `Date` object and calling `toISOString()`. On a mobile device this could cause noticeable UI jank.
  - Suggestion: Add a maximum lookback cap (e.g., 365 or 730 days). This is both a correctness safeguard and a performance bound:
    ```typescript
    const MAX_LOOKBACK_DAYS = 365;
    let iterations = 0;
    while (iterations < MAX_LOOKBACK_DAYS) {
        // ...existing logic...
        iterations++;
    }
    ```

- [MINOR] **Unused `sportFormIdSet` variable**: A `Set` is constructed from `sportFormIds` but never referenced -- the loop iterates `sportFormIds` directly.
  - Location: `client/src/stores/journal/entry.ts:47`
  - Impact: Minor unnecessary allocation. Likely a leftover from a refactor.
  - Suggestion: Remove `let sportFormIdSet = new Set(sportFormIds);`.

- [INFO] **Positive: Good use of O(1) Set lookups in streak calculation**: The streak service pre-builds `Set<string>` from entry dates and rest days before the walk loop, avoiding repeated linear scans. The `timeElapsedFields` map in `SportStatsService` is also well-structured for O(1) lookups per entry. The Dexie rest day collection correctly uses `.between()` with an indexed `date` field. These are sound design choices.

<!-- /SECTION:performance -->

---

<!-- SECTION:verification -->
## Verification

| Check | Command | Result |
|-------|---------|--------|
| Tests | `cd client && npx vitest run` | 139/139 passed (24 files) |
| TypeScript | `npx tsc --noEmit -p tsconfig.app.json` | 1 new error (suggestions.ts:103), 7 pre-existing |
| Baseline TS errors | `git stash && tsc && git stash pop` | 22 lines of errors (pre-existing, same set minus suggestions.ts) |

<!-- /SECTION:verification -->

---

<!-- SECTION:metadata -->
## Metadata

**Changed Files**: 23 (16 source, 6 test, 1 task doc)
**Diff Source**: `git diff main...385b1a1` (+1513/-6 lines)
**Reviewers Invoked**: spec-compliance-reviewer, senior-architecture-reviewer, security-code-reviewer, code-quality-reviewer, test-coverage-reviewer, performance-reviewer (documentation-accuracy-reviewer skipped)

<!-- /SECTION:metadata -->

# Splitting Decision: Sport Activity Tracking

**Date**: 2026-03-31
**Task**: `task-2026-03-30-sport-activity-tracking`
**Source**: `tech-decomposition-sport-activity-tracking.md`

---

## Verdict: MUST SPLIT

---

## Extracted Metrics

| Metric | Counted | Ideal | Maximum | Status |
|--------|---------|-------|---------|--------|
| Test cases | **36** | 10-15 | 20 | EXCEEDED (1.8x max) |
| New files | **~22** | 3-5 | 7 | EXCEEDED (3.1x max) |
| Use cases | **5** | 1-2 | 3 | EXCEEDED (1.7x max) |
| Test suites | **5** | 1-2 | 2 | EXCEEDED (2.5x max) |
| Domains touched | **3** | 1 | 1 | EXCEEDED (trackable model, RestDay entity, dashboard widgets) |

**Every single metric exceeds the MUST SPLIT threshold.** This is not a borderline case.

---

## Triggered Split Rules

**MUST SPLIT** triggers hit (need ANY one, got ALL):
- [x] > 20 test cases (36)
- [x] > 5 new files (~22)
- [x] > 3 use cases (5)
- [x] > 2 test suites (5)
- [x] Multiple domains touched (trackable model + RestDay entity + dashboard widget)

---

## Recommended Phases

### Phase 1: Sport Trackable Model, Schema Migration, and RestDay Entity (Vertical Slice: "Mark and filter sport trackables + manage rest days")

**Use cases delivered**:
1. User can create/edit trackables with `trackableType: 'sport'` and TIME_ELAPSED validation
2. User can toggle rest days on/off with idempotent persistence

**Implementation steps** (from tech-decomposition):
- Step 1: Add `trackableType` to Trackable model
- Step 2: Add `RestDay` model type
- Step 3: Bump Dexie schema to v26 with migration
- Step 4: Add `RestDayCollection` interface and implementations
- Step 5: Create `RestDayService` and wire into Services registry
- Step 6: Create `RestDayStore` with sync observer
- Step 9: Add sport trackable validation to `TrackableService`
- Step 10: Extend `TrackableStore` with sport filtering

**Test coverage**:
- TP-2: Rest Day Service (4 tests)
- TP-4: Trackable Type Validation (3 tests)
- TP-5: Type Switching (4 tests)
- TP-6: Migration (2 tests)
- TP-7: Sport Trackable Filtering (2 tests)

**Estimated scope**:
- New files: ~6 (model, collection, service, store, 2 test files)
- Test cases: ~15
- Test suites: 2 (restday.test.ts, validation.test.ts combined with filtering)
- Lines of domain/application code: ~150-200

**Why this grouping**: RestDay is a new entity that needs model -> schema -> collection -> service -> store delivered end-to-end. Trackable type flag and validation are tightly coupled to the same schema migration (v26) and must ship together. This phase delivers two testable behaviors: "sport trackables exist and are validated" and "rest days can be toggled." No UI yet, but every piece has behavioral tests with real consumers.

---

### Phase 2: Sport Page with Stats, Streak Logic, and Week Navigation (Vertical Slice: "View sport activities on a dedicated page")

**Use cases delivered**:
1. User can view the Sport page with weekly stats (sessions, duration, streak)
2. User can navigate weeks and see day-grouped sport activities with rest day toggles

**Implementation steps**:
- Step 7: Create `SportStreakService`
- Step 8: Create `SportStatsService`
- Step 11: Add sport entry querying to journal layer
- Step 12: Create Sport page components (all 7 Svelte files)
- Step 13: Add Sport route and navigation
- Step 14: Add trackable type selector to creation flow

**Test coverage**:
- TP-1: Streak Calculation (10 tests)
- TP-3: Sport Stats Computation (5 tests)
- TP-7.5: Edge Cases (4 tests)

**Estimated scope**:
- New files: ~12 (2 services, 7 Svelte components, 3 test files)
- Test cases: ~19
- Test suites: 2 (streak.test.ts, stats.test.ts)
- Lines of domain/application code: ~200-250

**Why this grouping**: The Sport page is the primary surface for this feature. Streak and stats services are pure-function services that only make sense when consumed by the Sport page -- shipping them without a UI would be a "foundation phase that predicts the future" anti-pattern. The page, stats, streak, and creation flow form a single coherent use case: "I can create sport trackables, view them on a dedicated page, and see my weekly stats." This phase is at the upper end of sizing but the components are tightly coupled -- the stats bar consumes streak service output, the activity list consumes journal queries, and the week nav controls what both display.

---

### Phase 3: Dashboard Widget with Quick-Log (Vertical Slice: "See sport summary on dashboard and quick-log activities")

**Use cases delivered**:
1. User can add a SPORT_SUMMARY widget to their dashboard showing weekly stats
2. User can quick-log a sport entry directly from the dashboard widget

**Implementation steps**:
- Step 15: Create `SPORT_SUMMARY` dashboard widget (all files)

**Test coverage**:
- TP-8: Dashboard Widget (2 tests)

**Estimated scope**:
- New files: ~5 (model definition, widget renderer, settings editor, quick-log component, 1 test file)
- Test cases: 2
- Test suites: 1
- Lines of domain/application code: ~100-150

**Why this grouping**: The dashboard widget is a self-contained feature that sits in the dashboard bounded context. It depends on sport stores/services from Phases 1-2 but has its own component tree, renderer registration, and settings editor. It can ship independently and deliver value on its own -- users who prefer the dashboard over the Sport page get their summary there.

---

## Phase Dependencies

```
Phase 1 ──► Phase 2 ──► Phase 3
                    └──► Phase 3
```

- Phase 2 depends on Phase 1 (needs trackable type flag, RestDay entity, sport filtering)
- Phase 3 depends on Phase 1 (needs sport stores/services) and Phase 2 (needs streak/stats services)
- Phase 3 could theoretically start after Phase 1 if streak/stats services were moved, but Phase 2 is the natural home for those services since the Sport page is their primary consumer

---

## Phase Sizing Summary

| Phase | Use Cases | Test Cases | New Files | Test Suites | Within Limits? |
|-------|-----------|------------|-----------|-------------|----------------|
| 1 | 2 | ~15 | ~6 | 2 | YES |
| 2 | 2 | ~19 | ~12 | 2 | BORDERLINE (files high, but 7 are small Svelte components) |
| 3 | 1 | 2 | ~5 | 1 | YES |

---

## Alternatives Considered

**Alternative A: Split by wave boundaries (5 phases matching Waves 1-5)**
Rejected. Waves 1-2 (model types + schema) would be a "foundation phase that predicts the future" -- types and schema with no testable behavior beyond migration tests. Waves are implementation ordering, not delivery boundaries.

**Alternative B: Split Phase 2 further (services vs UI)**
Rejected. Splitting streak/stats services from their Sport page consumers would create a "phase with zero testable behavior" for the services phase (only unit tests, no real UI consumer). The services are pure functions -- their tests pass regardless of whether the Sport page exists -- but shipping them alone delivers no user-facing value.

**Alternative C: No split (single PR)**
Rejected. 36 test cases, 22 files, and 5 use cases would make for a 45-60 minute review. The three bounded contexts (trackable model, RestDay entity, dashboard widget) have different risk profiles and can be reviewed independently.

---

## Notes for Decomposer

- Each phase needs its own tech-decomposition derived from the parent document
- Phase 1 tech-decomposition should include the DexieMigrator pattern details and DummyRestDayCollection setup, as these set the foundation
- Phase 2 tech-decomposition should carry the streak pseudocode from discovery Section 7 verbatim
- Phase 3 tech-decomposition should document both RENDERERS maps (display + edit sidebar) since that is a known gotcha flagged in Step 15
- The test file `client/tests/sport/filtering.test.ts` belongs in Phase 1 (it tests `getSportTrackables` which ships in Phase 1), not Phase 2

---

## Decomposition Complete

**Executed**: 2026-03-31
**Executed By**: task-decomposer agent

### Created Phases

| Phase | Folder | Linear Issue | Status |
|-------|--------|--------------|--------|
| Phase 1: Sport Data Foundation | `phase-1-data-foundation/` | [WYT-197](https://linear.app/alexandrbasis/issue/WYT-197/phase-1-sport-data-foundation) | Ready |
| Phase 2: Sport Page | `phase-2-sport-page/` | [WYT-198](https://linear.app/alexandrbasis/issue/WYT-198/phase-2-sport-page) | Ready |
| Phase 3: Sport Dashboard Widget | `phase-3-dashboard-widget/` | [WYT-199](https://linear.app/alexandrbasis/issue/WYT-199/phase-3-sport-dashboard-widget) | Ready |

### Blocking Relationships
- WYT-197 blocks WYT-198
- WYT-198 blocks WYT-199

### Parent Document
- **Archived**: `initial-tech-decomposition-sport-activity-tracking-ARCHIVED.md`

### Next Steps
1. Implement phases in sequence using `/si` command with phase path
2. Each phase follows standard workflow: `/si` -> `/sr`
3. Dependencies must be merged before dependent phase starts
4. Track progress in Linear (move to In Progress when starting)

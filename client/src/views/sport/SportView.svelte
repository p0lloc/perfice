<script lang="ts">
    import {onMount} from "svelte";
    import {faDumbbell, faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import SportStatsBar from "@perfice/components/sport/SportStatsBar.svelte";
    import SportWeekNav from "@perfice/components/sport/SportWeekNav.svelte";
    import SportActivityList from "@perfice/components/sport/SportActivityList.svelte";
    import SportEmptyState from "@perfice/components/sport/SportEmptyState.svelte";
    import {trackables, forms, journal, restDays, weekStart} from "@perfice/stores";
    import {dateToWeekStart, dateToWeekEnd} from "@perfice/util/time/simple";
    import {SportStatsService} from "@perfice/services/sport/stats";
    import {SportStreakService} from "@perfice/services/sport/streak";
    import type {Trackable, TrackableType} from "@perfice/model/trackable/trackable";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import type {Form} from "@perfice/model/form/form";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {RestDay} from "@perfice/model/sport/restday";
    import type {TrackableSuggestion} from "@perfice/model/trackable/suggestions";
    import CreateTrackableModal from "@perfice/components/trackable/modals/create/CreateTrackableModal.svelte";

    let streakService = new SportStreakService();
    let statsService = new SportStatsService(streakService);
    let createTrackableModal: CreateTrackableModal;

    let weekOffset = $state(0);

    let currentWeekStart = $derived(getWeekBounds(weekOffset).start);
    let currentWeekEnd = $derived(getWeekBounds(weekOffset).end);

    function getWeekBounds(offset: number) {
        let base = new Date();
        base.setDate(base.getDate() + (offset * 7));
        let start = dateToWeekStart(base, $weekStart);
        let end = dateToWeekEnd(base, $weekStart);
        return {start, end};
    }

    function prevWeek() { weekOffset--; }
    function nextWeek() { weekOffset++; }

    // Async data loading
    let sportTrackables = $state<Trackable[]>([]);
    let sportEntries = $state<JournalEntry[]>([]);
    let allForms = $state<Form[]>([]);
    let allRestDays = $state<RestDay[]>([]);
    let loaded = $state(false);

    async function loadData() {
        let [st, f, rd] = await Promise.all([
            trackables.getSportTrackables(),
            $forms,
            $restDays,
        ]);

        sportTrackables = st;
        allForms = f;
        allRestDays = rd;

        let sportFormIds = sportTrackables.map(t => t.formId);
        if (sportFormIds.length > 0) {
            sportEntries = await journal.getSportEntries(
                currentWeekStart.getTime(),
                currentWeekEnd.getTime(),
                sportFormIds
            );
        } else {
            sportEntries = [];
        }

        loaded = true;
    }

    // Reload entries when week changes
    $effect(() => {
        // Access currentWeekStart/End to track them
        let _start = currentWeekStart;
        let _end = currentWeekEnd;
        loadData();
    });

    onMount(() => {
        trackables.load();
        restDays.load();
    });

    // Compute stats
    let weekStats = $derived.by(() => {
        if (!loaded || sportTrackables.length === 0) {
            return {sessions: 0, totalDurationMs: 0, streak: 0};
        }
        return statsService.computeWeekStats(
            sportEntries, sportTrackables, allForms, allRestDays,
            currentWeekStart, currentWeekEnd, new Date()
        );
    });

    let hasSportTrackables = $derived(sportTrackables.length > 0);

    async function handleToggleRestDay(dateStr: string) {
        await restDays.toggle(dateStr);
        await loadData();
    }

    function createSportTrackable() {
        createTrackableModal.open(null, 'sport');
    }

    function onSuggestionSelected(_categoryId: string | null, suggestion: TrackableSuggestion, trackableType: TrackableType) {
        trackables.createTrackableFromSuggestion(suggestion, null, trackableType);
    }

    function onSingleValue(_categoryId: string | null, name: string, icon: string, type: FormQuestionDataType, trackableType: TrackableType) {
        trackables.createSingleValueTrackable({categoryId: null, name, icon, type, trackableType});
    }
</script>

<CreateTrackableModal bind:this={createTrackableModal} onSelectSuggestion={onSuggestionSelected} onSingleValue={onSingleValue}/>
<MobileTopBar title="Sport"/>
<div class="center-view md:mt-8 md:p-0 px-4 py-2 main-content">
    <div class="hidden md:flex items-center gap-2 mb-4">
        <Fa icon={faDumbbell} class="text-blue-500"/>
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Sport</h1>
    </div>

    <SportWeekNav weekStart={currentWeekStart} weekEnd={currentWeekEnd} onPrev={prevWeek} onNext={nextWeek}/>

    {#if !loaded}
        <div class="py-8 text-center text-gray-400">Loading...</div>
    {:else if hasSportTrackables}
        <div class="mt-3">
            <SportStatsBar
                sessions={weekStats.sessions}
                durationFormatted={statsService.formatDuration(weekStats.totalDurationMs)}
                streak={weekStats.streak}
            />
        </div>

        <div class="mt-4">
            <SportActivityList
                entries={sportEntries}
                trackables={sportTrackables}
                forms={allForms}
                restDays={allRestDays}
                weekStart={currentWeekStart}
                weekEnd={currentWeekEnd}
                onToggleRestDay={handleToggleRestDay}
            />
        </div>

        <button onclick={createSportTrackable}
                class="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg
                       flex items-center justify-center hover:bg-blue-600 transition-colors z-10">
            <Fa icon={faPlusCircle} class="text-xl"/>
        </button>
    {:else}
        <SportEmptyState onCreate={createSportTrackable}/>
    {/if}
</div>

<script lang="ts">
    import type {Readable} from "svelte/store";
    import {tagDetailedAnalytics} from "@perfice/main";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import type {TagDetailedAnalyticsResult} from "@perfice/stores/analytics/tags";
    import CorrelationAnalytics from "@perfice/components/analytics/details/CorrelationAnalytics.svelte";
    import TagWeekDayAnalytics from "@perfice/components/analytics/details/tag/TagWeekDayAnalytics.svelte";

    let {id}: { id: string } = $props();
    let res = $state<Readable<Promise<TagDetailedAnalyticsResult>>>(
        tagDetailedAnalytics(id, SimpleTimeScopeType.DAILY),
    );
</script>

{#await $res}
    Loading
{:then val}
    <div class="md:grid-cols-2 grid mt-8 gap-6">
        <CorrelationAnalytics correlations={val.correlations}/>
        <TagWeekDayAnalytics analytics={val.weekDayAnalytics}/>
    </div>
{/await}
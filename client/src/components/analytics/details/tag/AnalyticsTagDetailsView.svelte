<script lang="ts">
    import type {Readable} from "svelte/store";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import type {TagDetailedAnalyticsResult} from "@perfice/stores/analytics/tags";
    import CorrelationAnalytics from "@perfice/components/analytics/details/CorrelationAnalytics.svelte";
    import TagWeekDayAnalytics from "@perfice/components/analytics/details/tag/TagWeekDayAnalytics.svelte";
    import Heatmap from "@perfice/components/analytics/Heatmap.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTag} from "@fortawesome/free-solid-svg-icons";
    import {tagDetailedAnalytics} from "@perfice/stores";

    let {id}: { id: string } = $props();
    let res = $state<Readable<Promise<TagDetailedAnalyticsResult>>>(
        tagDetailedAnalytics(id, SimpleTimeScopeType.DAILY),
    );
</script>

{#await $res}
    There is not enough data to show analytics for this tag.
{:then val}
    <h3 class="text-4xl font-bold mt-8 row-gap">
        <Fa icon={faTag}/>
        {val.tag.name}
    </h3>
    <div class="md:grid-cols-2 grid mt-8 gap-6">
        <div>
            <h3 class="text-3xl font-bold mb-4">Heatmap</h3>
            <div class="border p-4 rounded-md">
                <Heatmap date={val.date} values={val.values}/>
            </div>
            <div class="mt-8">
                <TagWeekDayAnalytics analytics={val.weekDayAnalytics}/>
            </div>
        </div>
        <CorrelationAnalytics correlations={val.correlations}/>
    </div>
{/await}
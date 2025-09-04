<script lang="ts">
    import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
    import {analytics} from "@perfice/stores";
    import NewCorrelations from "@perfice/components/analytics/NewCorrelations.svelte";
    import {faMagicWandSparkles} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {}: {
        settings: DashboardTrackableWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let newCorrelations = $derived(analytics.getNewestCorrelations(5, new Date().getTime()));
</script>


<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col ">
    {#await $analytics}
        Loading...
    {:then result}
        <div class="border-b basic self-stretch p-2 font-bold text-gray-600 row-between">
            <div class="row-gap">
                <Fa class="text-green-500" icon={faMagicWandSparkles}/>
                <span>New correlations</span>
            </div>
        </div>
        <div class="overflow-y-scroll scrollbar-hide w-full p-4 flex flex-col gap-2">
            <NewCorrelations {newCorrelations} result={result}/>
        </div>
    {/await}
</div>
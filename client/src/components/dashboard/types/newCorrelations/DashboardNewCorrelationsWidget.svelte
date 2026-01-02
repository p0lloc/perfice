<script lang="ts">
    import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
    import {analytics} from "@perfice/stores";
    import NewCorrelations from "@perfice/components/analytics/NewCorrelations.svelte";
    import {faMagicWandSparkles} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import DashboardWidgetBase from "@perfice/components/dashboard/DashboardWidgetBase.svelte";

    let {}: {
        settings: DashboardTrackableWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let newCorrelations = $derived(analytics.getNewestCorrelations(5, new Date().getTime()));
</script>


{#await $analytics}
    <DashboardWidgetBase>
        <div class="p-4">Loading...</div>
    </DashboardWidgetBase>

{:then result}
    <DashboardWidgetBase title="New correlations" icon={faMagicWandSparkles}>
        <div class="overflow-y-scroll scrollbar-hide w-full p-4 flex flex-col gap-2">
            <NewCorrelations {newCorrelations} result={result}/>
        </div>
    </DashboardWidgetBase>
{/await}
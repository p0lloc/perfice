<script lang="ts">
    import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
    import TrackableCard from "@perfice/components/trackable/card/TrackableCard.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {trackableWidget, weekStart} from "@perfice/stores";

    let {settings, openFormModal}: {
        settings: DashboardTrackableWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    let res = $derived(trackableWidget(settings));

    function onLog(trackable: Trackable) {
        openFormModal(trackable.formId);
    }
</script>

{#await $res}
    Loading...
{:then value}
    <TrackableCard class="max-h-none" trackable={value.trackable} date={$dashboardDate}
                   weekStart={$weekStart} onEdit={() => {}} onLog={() => onLog(value.trackable)}/>
{/await}
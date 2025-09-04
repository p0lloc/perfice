<script lang="ts">
    import type {DashboardTrackableWidgetSettings} from "@perfice/model/dashboard/widgets/trackable";
    import type {Form} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {trackables} from "@perfice/stores";

    let {settings, onChange, forms}: {
        settings: DashboardTrackableWidgetSettings,
        onChange: (settings: DashboardTrackableWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();


    let availableTrackables = $derived.by(async () => (await trackables.fetchTrackables()).map(v => {
        return {value: v.id, name: v.name}
    }));

    function onTrackableChange(trackableId: string) {
        onChange({...settings, trackableId: trackableId});
    }
</script>
{#await availableTrackables}
    Loading...
{:then value}
    <div class="row-between">
        Trackable
        <BindableDropdownButton value={settings.trackableId} items={value}
                                onChange={onTrackableChange}/>

    </div>
{/await}

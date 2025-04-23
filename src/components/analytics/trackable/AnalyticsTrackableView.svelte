<script lang="ts">
    import {analyticsSettings} from "@perfice/stores";
    import EditAnalyticsSettingsModal from "@perfice/components/analytics/modal/EditAnalyticsSettingsModal.svelte";
    import AnalyticsTrackableCard from "@perfice/components/analytics/trackable/AnalyticsTrackableCard.svelte";
    import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
    import type {FormQuestion} from "@perfice/model/form/form";
    import {trackableAnalytics, trackables} from "@perfice/stores";

    let res = $derived(trackableAnalytics());
    let editSettingsModal: EditAnalyticsSettingsModal;

    trackables.load();

    function openSettingsModal(settings: AnalyticsSettings, questions: FormQuestion[]) {
        editSettingsModal.open(structuredClone(settings), questions);
    }

    function onSettingsSave(settings: AnalyticsSettings) {
        analyticsSettings.updateSettings(settings);
    }
</script>

<EditAnalyticsSettingsModal bind:this={editSettingsModal} onSave={onSettingsSave}/>
<div class="md:grid-cols-4 grid gap-4 mt-4">
    {#await $res}
        Loading...
    {:then values}
        {#each values as value(value.trackable.id)}
            <AnalyticsTrackableCard {value}
                                    onEditSettings={() => openSettingsModal(value.settings, value.questions)}/>
        {/each}
    {/await}
</div>

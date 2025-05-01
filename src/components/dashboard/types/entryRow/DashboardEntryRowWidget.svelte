<script lang="ts">
    import EntryRowItem from "./EntryRowItem.svelte";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/widgets/entryRow";
    import {entryRowWidget, weekStart} from "@perfice/stores";

    let {settings, dependencies, openFormModal}: {
        settings: DashboardEntryRowWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    // The cache key is based on the settings, since we update the variable whenever form/question changes
    let result = $derived(entryRowWidget(dependencies, settings, $dashboardDate,
        $weekStart, `${settings.formId}:${settings.questionId}`));

    function log() {
        openFormModal(settings.formId);
    }
</script>

<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col ">
    {#await $result}
        <span class="p-2">
            Please select a form
        </span>
    {:then value}
        <div class="border-b basic self-stretch p-2 font-bold text-gray-600 row-between">
            <div class="row-gap">
                <Icon name={value.icon} class="text-2xl text-green-500"/>
                <span>{value.name}</span>
            </div>
            <IconButton icon={faPlus} onClick={log}/>
        </div>
        <div class="p-2 flex gap-4 items-center flex-1 overflow-x-auto overflow-y-hidden w-full">
            {#each value.entries as entry}
                <EntryRowItem {entry}/>
            {:else}
                <p class="p-2">There are no entries yet</p>
            {/each}
        </div>
    {/await}
</div>

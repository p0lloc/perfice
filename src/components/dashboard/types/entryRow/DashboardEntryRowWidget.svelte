<script lang="ts">
    import EntryRowItem from "./EntryRowItem.svelte";
    import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/dashboard";

    let {settings}: { settings: DashboardEntryRowWidgetSettings } = $props();
</script>

<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col ">
    <div class="border-b basic self-stretch p-2 font-bold text-gray-600">
        {settings.formId}
    </div>
    <div class="p-2 flex gap-4 items-center flex-1 overflow-x-auto overflow-y-hidden w-full">
        {#each Array(10) as _, i}
            <EntryRowItem/>
        {/each}
    </div>
</div>

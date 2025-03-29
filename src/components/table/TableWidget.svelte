<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import TableWidgetEntry from "@perfice/components/dashboard/types/table/TableWidgetEntry.svelte";
    import TableWidgetGroupHeader from "@perfice/components/dashboard/types/table/TableWidgetGroupHeader.svelte";
    import {tableWidget, weekStart} from "@perfice/app";
    import {type PrimitiveValue, pString} from "@perfice/model/primitive/primitive";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {TableWidgetGroup} from "@perfice/stores/table/table";
    import type {TableWidgetSettings} from "@perfice/model/table/table";

    let {openFormModal, settings, date, listVariableId}: {
        settings: TableWidgetSettings,
        listVariableId: string,
        date: Date,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void
    } = $props();

    // TODO: use proper key here
    let result = $derived(tableWidget(listVariableId, settings, date,
        $weekStart, `${settings.formId}:${settings.groupBy}:${settings.prefix.length}`));

    function onLogAny() {
        openFormModal(settings.formId);
    }

    function onLogGroup(group: TableWidgetGroup) {
        let groupBy = settings.groupBy;
        if (groupBy == null || group.group == null) return;

        openFormModal(settings.formId, {
            [groupBy]: pString(group.group)
        });
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
                <Icon name={value.icon} class="text-green-500"/>
                <span>{value.name}</span>
            </div>
            <IconButton icon={faPlus} onClick={onLogAny}/>
        </div>
        <div class="overflow-y-scroll scrollbar-hide w-full">
            {#each value.groups as group}
                {#if group.group != null}
                    <TableWidgetGroupHeader name={group.name} onLog={() => onLogGroup(group)}/>
                {/if}
                {#each group.entries as entry}
                    <TableWidgetEntry {entry}/>
                {/each}
            {/each}
        </div>
    {/await}
</div>

<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import TableWidgetEntry from "@perfice/components/dashboard/types/table/TableWidgetEntry.svelte";
    import TableWidgetGroupHeader from "@perfice/components/dashboard/types/table/TableWidgetGroupHeader.svelte";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {TableWidgetGroup} from "@perfice/stores/sharedWidgets/table/table";
    import type {TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table";
    import {tableWidget, weekStart} from "@perfice/stores";

    let {openFormModal, settings, date, listVariableId, extraAnswers = []}: {
        settings: TableWidgetSettings,
        listVariableId: string,
        date: Date,
        openFormModal: (formId: string, answers?: Record<string, PrimitiveValue>) => void,
        extraAnswers?: Record<string, PrimitiveValue>[]
    } = $props();

    // TODO: use proper key here
    let result = $derived(tableWidget(listVariableId, settings, date,
        $weekStart, `${settings.formId}:${settings.groupBy}:${settings.prefix.length}`, extraAnswers));

    function onLogAny() {
        openFormModal(settings.formId);
    }

    function onLogGroup(group: TableWidgetGroup) {
        let groupBy = settings.groupBy;
        if (groupBy == null || group.group == null) return;

        openFormModal(settings.formId, {
            [groupBy]: group.group
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
                <Icon name={value.icon} class="text-green-500 text-xl"/>
                <span>{value.name}</span>
            </div>
            <IconButton icon={faPlus} onClick={onLogAny}/>
        </div>
        <div class="overflow-y-scroll scrollbar-hide w-full min-h-14">
            {#each value.groups as group}
                {#if group.group != null}
                    <TableWidgetGroupHeader name={group.name} onLog={() => onLogGroup(group)}/>
                {/if}
                {#each group.entries as entry}
                    <TableWidgetEntry {entry}/>
                {/each}
            {:else}
                <p class="p-2">There are no entries yet</p>
            {/each}
        </div>
    {/await}
</div>

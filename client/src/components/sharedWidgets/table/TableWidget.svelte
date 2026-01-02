<script lang="ts">
    import TableWidgetEntry from "@perfice/components/dashboard/types/table/TableWidgetEntry.svelte";
    import TableWidgetGroupHeader from "@perfice/components/dashboard/types/table/TableWidgetGroupHeader.svelte";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {TableWidgetGroup} from "@perfice/stores/sharedWidgets/table/table";
    import type {TableWidgetSettings} from "@perfice/model/sharedWidgets/table/table";
    import {tableWidget, weekStart} from "@perfice/stores";
    import DashboardWidgetBase from "@perfice/components/dashboard/DashboardWidgetBase.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

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

{#await $result}
    <DashboardWidgetBase>
        <div class="p-4">
            Please select a form
        </div>
    </DashboardWidgetBase>
{:then value}
    <DashboardWidgetBase title={value.name} icon={value.icon}>
        {#snippet actions()}
            <IconButton icon={faPlus} onClick={onLogAny}/>
        {/snippet}

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
    </DashboardWidgetBase>
{/await}

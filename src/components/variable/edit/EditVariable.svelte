<script lang="ts">
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {type Component, untrack} from "svelte";
    import {variableEditProvider} from "@perfice/app";
    import EditAggregationVariable from "@perfice/components/variable/edit/aggregation/EditAggregationVariable.svelte";
    import EditCalculationVariable from "@perfice/components/variable/edit/calculation/EditCalculationVariable.svelte";
    import EditVariableName from "@perfice/components/variable/edit/EditVariableName.svelte";
    import type {EditConstantOrVariableState} from "@perfice/model/goal/ui";
    import EditLatestVariable from "@perfice/components/variable/edit/latest/EditLatestVariable.svelte";

    let {variableId, onEdit, editName = false, useDisplayValues = false}: {
        variableId: string,
        onEdit: (v: EditConstantOrVariableState) => void,
        editName?: boolean
        useDisplayValues?: boolean
    } = $props();

    let variable = $state<Variable | null>(null);
    let editState = $state<any>(null);

    const RENDERERS: Partial<Record<VariableTypeName, Component<{
        value: any,
        editState: any,
        variable: Variable,
        onEdit: (v: EditConstantOrVariableState) => void,
        useDisplayValues?: boolean
    }>>> = {
        [VariableTypeName.AGGREGATE]: EditAggregationVariable,
        [VariableTypeName.CALCULATION]: EditCalculationVariable,
        [VariableTypeName.LATEST]: EditLatestVariable,
    };

    async function loadVariable(variableId: string) {
        let variableById = variableEditProvider.getVariableById(variableId) ?? null;
        let untracked = untrack(() => variableById);
        if (untracked == null) return;
        editState = await variableEditProvider.getEditState(untracked);
        variable = variableById;
    }

    function onVariableChange(v: Variable) {
        variable = v;
    }

    $effect(() => {
        loadVariable(variableId);
    });

    let RendererComponent = $derived(variable != null ? RENDERERS[variable.type.type] : null);
</script>
{#if variable != null && editState != null}
    {#if editName}
        <EditVariableName {variable} onChange={onVariableChange}/>
    {/if}
    <div>
        {#if RendererComponent != null}
            <RendererComponent {variable} value={variable.type.value} {editState} {onEdit}
                               useDisplayValues={useDisplayValues}/>
        {:else}
            This variable type has no settings.
        {/if}
    </div>
{/if}

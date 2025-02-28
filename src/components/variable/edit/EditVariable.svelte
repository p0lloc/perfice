<script lang="ts">
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {type Component, onMount, untrack} from "svelte";
    import {variableEditProvider} from "@perfice/main";
    import EditAggregationVariable from "@perfice/components/variable/edit/aggregation/EditAggregationVariable.svelte";
    import EditCalculationVariable from "@perfice/components/variable/edit/calculation/EditCalculationVariable.svelte";
    import type {ConstantOrVariable} from "@perfice/services/variable/types/goal";
    import EditVariableName from "@perfice/components/variable/edit/EditVariableName.svelte";
    import type {EditConstantOrVariableState} from "@perfice/model/goal/ui";
    import EditLatestVariable from "@perfice/components/variable/edit/latest/EditLatestVariable.svelte";

    let {variableId, onEdit}: {
        variableId: string,
        onEdit: (v: EditConstantOrVariableState) => void
    } = $props();

    let variable = $state<Variable | null>(null);
    let editState = $state<any>(null);

    const RENDERERS: Partial<Record<VariableTypeName, Component<{
        value: any,
        editState: any,
        variable: Variable,
        onEdit: (v: EditConstantOrVariableState) => void
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
    <EditVariableName {variable} onChange={onVariableChange}/>
    <div>
        {#if RendererComponent != null}
            <RendererComponent {variable} value={variable.type.value} {editState} {onEdit} />
        {:else}
            This variable type has no settings.
        {/if}
    </div>
{/if}

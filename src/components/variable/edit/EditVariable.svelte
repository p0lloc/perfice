<script lang="ts">
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {type Component, onMount} from "svelte";
    import {variableEditProvider} from "@perfice/main";
    import EditAggregationVariable from "@perfice/components/variable/edit/aggregation/EditAggregationVariable.svelte";

    let {variableId}: { variableId: string } = $props();

    let variable = $state<Variable | null>(null);
    let editState = $state<any>(null);

    const RENDERERS: Partial<Record<VariableTypeName, Component<{
        value: any,
        editState: any,
        variable: Variable
    }>>> = {
        [VariableTypeName.AGGREGATE]: EditAggregationVariable,
    };

    onMount(loadVariable);

    async function loadVariable() {
        variable = variableEditProvider.getVariableById(variableId) ?? null;
        if (variable == null) return;
        editState = await variableEditProvider.getEditState(variable);
    }

    function onNameChange(e: { currentTarget: HTMLInputElement }) {
        // @ts-ignore
        let variableSnapshot: Variable | null = $state.snapshot<Variable | null>(variable);
        if (variableSnapshot == null) return;

        let update: Variable = {
            ...variableSnapshot,
            // @ts-ignore
            type: {...variableSnapshot.type, value: variable!.type.value},
            name: e.currentTarget.value
        }
        // TODO: can't use $state.snapshot on class instances
        variableEditProvider.updateVariable(update);
        variable = update;
    }

    let RendererComponent = $derived(variable != null ? RENDERERS[variable.type.type] : null);
</script>
{#if variable != null && editState != null}
    <div class="flex justify-end">
        <input value={variable.name} type="text" class="border" onchange={onNameChange}/>
    </div>
    <div>

        {#if RendererComponent != null}
            <RendererComponent {variable} value={variable.type.value} {editState}/>
        {:else}
            This variable type has no settings.
        {/if}
    </div>
{/if}

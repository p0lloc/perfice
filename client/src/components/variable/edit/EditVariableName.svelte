<script lang="ts">
    import type {Variable} from "@perfice/model/variable/variable";

    import {variableEditProvider} from "@perfice/stores";

    let {variable, onChange}: { variable: Variable, onChange: (v: Variable) => void } = $props();

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
        onChange(update);
    }
</script>

<div class="flex justify-end">
    <input value={variable.name} type="text" class="border" onchange={onNameChange}/>
</div>

<script lang="ts">
    import {
        COMPARISON_SOURCE_TYPES,
        type GoalAddSourceAction,
    } from "@perfice/model/goal/ui";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import type { VariableTypeName } from "@perfice/model/variable/variable";

    let {
        action,
        onClose,
    }: { action: GoalAddSourceAction; onClose: () => void } = $props();

    function onSelect(a: VariableTypeName) {
        action.onSourceSelected(a);
        onClose();
    }
</script>

<div class="flex flex-col gap-4 mt-4">
    {#each COMPARISON_SOURCE_TYPES as type}
        <CardButton
            icon={type.icon}
            title={type.name}
            description={type.description}
            onClick={() => onSelect(type.type)}
        />
    {/each}
</div>

<script lang="ts">
    import {
        GOAL_CONDITION_TYPES,
        type GoalAddConditionAction,
    } from "@perfice/model/goal/ui";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {
        createGoalConditionValue,
        GoalConditionType,
    } from "@perfice/services/variable/types/goal";

    let {
        action,
        onClose,
    }: { action: GoalAddConditionAction; onClose: () => void } = $props();

    function onSelect(type: GoalConditionType) {
        action.onConditionSelected({
            id: crypto.randomUUID(),
            type: type,
            // @ts-ignore
            value: createGoalConditionValue(type),
        });

        onClose();
    }
</script>

<div class="flex flex-col gap-4 mt-4">
    {#each GOAL_CONDITION_TYPES as type}
        <CardButton
            icon={type.icon}
            title={type.name}
            description={type.description}
            onClick={() => onSelect(type.type)}
        />
    {/each}
</div>

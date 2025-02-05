<script lang="ts">
    import {GOAL_CONDITION_TYPES, type GoalAddConditionAction} from "@perfice/model/goal/ui";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {
        createGoalConditionValue,
        GoalConditionType
    } from "@perfice/services/variable/types/goal";
    import {faBullseye, faGreaterThanEqual, faTimes} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import GoalSidebarTitle from "@perfice/components/goal/editor/sidebar/GoalSidebarTitle.svelte";

    let {action, onClose}: { action: GoalAddConditionAction, onClose: () => void } = $props();

    function onSelect(type: GoalConditionType) {
        action.onConditionSelected({
            id: crypto.randomUUID(),
            type: type,
            // @ts-ignore
            value: createGoalConditionValue(type)
        });

        onClose();
    }

</script>

<GoalSidebarTitle title="Add condition" onClose={onClose}/>

<div class="flex flex-col gap-4 mt-4">
    {#each GOAL_CONDITION_TYPES as type}
        <CardButton icon={type.icon} title={type.name} description={type.description}
                    onClick={() => onSelect(type.type)}/>
    {/each}
</div>

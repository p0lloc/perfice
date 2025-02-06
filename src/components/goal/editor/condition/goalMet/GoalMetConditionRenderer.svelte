<script lang="ts">
    import {GoalMetGoalCondition} from "@perfice/services/variable/types/goal";
    import type {GoalSidebarAction} from "@perfice/model/goal/ui";

    let {condition, onValueChange, onSidebar}: {
        condition: GoalMetGoalCondition,
        onValueChange: (v: GoalMetGoalCondition) => void,
        onSidebar: (v: GoalSidebarAction) => void
    } = $props();
</script>

jsdfl

<script lang="ts">
    import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
    import type {Form} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {goals} from "@perfice/stores";
    import {onMount} from "svelte";
    import type {Goal} from "@perfice/model/goal/goal";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

    let {settings, onChange}: {
        settings: DashboardGoalWidgetSettings,
        onChange: (settings: DashboardGoalWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

    let loadedGoals = $state<Goal[]>([]);
    // This is done to avoid caching all goals unnecessarily in the store
    let availableGoals = $derived<DropdownMenuItem<string>[]>(loadedGoals.map(v => {
        return {value: v.variableId, name: v.name};
    }));

    function onGoalChange(variableId: string) {
        let goal = loadedGoals.find(g => g.variableId == variableId);
        if (goal == null) return;

        onChange({...settings, goalVariableId: goal.variableId, goalStreakVariableId: goal.streakVariableId});
    }

    onMount(async () => {
        loadedGoals = await goals.fetchGoals();
    });
</script>

<div class="row-between">
    Goal
    <BindableDropdownButton value={settings.goalVariableId} items={availableGoals}
                            onChange={onGoalChange}/>
</div>
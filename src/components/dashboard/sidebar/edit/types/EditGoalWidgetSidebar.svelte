<script lang="ts">
    import type {DashboardGoalWidgetSettings} from "@perfice/model/dashboard/widgets/goal";
    import type {Form} from "@perfice/model/form/form";
    import {goals} from "@perfice/main";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";

    let {settings, onChange}: {
        settings: DashboardGoalWidgetSettings,
        onChange: (settings: DashboardGoalWidgetSettings) => void,
        forms: Form[],
        dependencies: Record<string, string>
    } = $props();

    // This is done to avoid caching all goals unnecessarily in the store
    let availableGoals = $derived.by(async () => (await goals.fetchGoals()).map(v => {
        return {value: v.variableId, name: v.name}
    }));

    function onGoalChange(goalId: string) {
        onChange({...settings, goalVariableId: goalId});
    }
</script>

{#await availableGoals}
    Loading...
{:then value}
    <div class="row-between">
        Goal
        <BindableDropdownButton value={settings.goalVariableId} items={value}
                                onChange={onGoalChange}/>
    </div>
{/await}
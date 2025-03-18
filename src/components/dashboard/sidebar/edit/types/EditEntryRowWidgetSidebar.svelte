<script lang="ts">
    import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/dashboard";
    import {forms} from "@perfice/main";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";

    let {settings, onChange}: {
        settings: DashboardEntryRowWidgetSettings,
        onChange: (settings: DashboardEntryRowWidgetSettings) => void
    } = $props();
</script>

{#await $forms}
    Loading...
{:then values}
    <BindableDropdownButton value={settings.formId} items={values.map(v => {
        return {value: v.id, name: v.name}
    })} onChange={(v) => onChange({...settings, formId: v})}/>
    <BindableDropdownButton value={settings.questionId} items={values.find(v => v.id == settings.formId)?.questions.map(v => {
        return {value: v.id, name: v.name}
    }) ?? []} onChange={(v) => onChange({...settings, questionId: v})}/>
{/await}

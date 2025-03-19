<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import type {DashboardTableWidgetSettings} from "@perfice/model/dashboard/widgets/table";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import EditTextOrDynamic from "@perfice/components/base/textOrDynamic/EditTextOrDynamic.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";

    let {settings, onChange, forms}: {
        settings: DashboardTableWidgetSettings,
        onChange: (settings: DashboardTableWidgetSettings) => void,
        forms: Form[]
    } = $props();

    let selectedForm = $derived<Form | undefined>(forms.find(f => f.id == settings.formId));
    let availableForms = $derived(forms.map(v => {
        return {value: v.id, name: v.name}
    }));

    let availableQuestions = $derived(selectedForm?.questions.map(v => {
        return {value: v.id, name: v.name}
    }) ?? []);

    function onGroupByChange(value: string) {
        onChange({
            ...settings,
            groupBy: value,
        });
    }

    function addGroupBy() {
        onChange({
            ...settings,
            groupBy: "",
        });
    }

    function removeGroupBy() {
        onChange({
            ...settings,
            groupBy: null
        });
    }

    function onFormChange(formId: string) {
        let form = forms.find(f => f.id == formId);
        if (form == null) return;

        onChange({
            ...settings,
            formId,
        });
    }
</script>

<div class="row-between">
    Form
    <BindableDropdownButton value={settings.formId} items={availableForms}
                            onChange={onFormChange}/>
</div>

<div class="row-between mt-2">
    Group by
    {#if settings.groupBy != null}
        <div class="row-gap">
            <BindableDropdownButton value={settings.groupBy} items={availableQuestions}
                                    onChange={onGroupByChange}/>
            <IconButton icon={faTimes} onClick={removeGroupBy}/>
        </div>
    {:else}
        <Button onClick={addGroupBy}>Add</Button>
    {/if}
</div>

{#if selectedForm != null}
    <hr class="my-4"/>
    <div class="mt-2">
        <p class="mb-2 text-lg">Prefix</p>
        <EditTextOrDynamic
                value={settings.prefix}
                availableDynamic={selectedForm.questions}
                onChange={(e) => onChange({...settings, prefix: e})}
                getDynamicId={(v) => v.id}
                getDynamicText={(v) => v.name}
        />

        <hr class="my-4"/>
    </div>
    <div>
        <p class="mb-2 text-lg">Suffix</p>
        <EditTextOrDynamic
                value={settings.suffix}
                availableDynamic={selectedForm.questions}
                onChange={(e) => onChange({...settings, suffix: e})}
                getDynamicId={(v) => v.id}
                getDynamicText={(v) => v.name}
        />
    </div>
{/if}

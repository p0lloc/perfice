<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import type {ReflectionFormWidgetSettings} from "@perfice/model/reflection/widgets/form";

    let {settings, onChange, forms}: {
        settings: ReflectionFormWidgetSettings,
        forms: Form[],
        onChange: (settings: ReflectionFormWidgetSettings) => void
    } = $props();

    let availableForms = $derived(forms.map(v => {
        return {value: v.id, name: v.name}
    }));

    function onFormChange(formId: string) {
        onChange({...settings, formId});
    }
</script>
<div class="row-between">
    Form
    <BindableDropdownButton value={settings.formId} items={availableForms}
                            onChange={onFormChange}/>
</div>

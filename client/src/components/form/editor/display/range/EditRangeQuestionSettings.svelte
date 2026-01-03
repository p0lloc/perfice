<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {RangeFormQuestionSettings, RangeLabel} from "@perfice/model/form/display/range";
    import DndOptionList from "@perfice/components/form/editor/DndOptionList.svelte";
    import AsyncInlineCreateInput from "@perfice/components/base/inline/AsyncInlineCreateInput.svelte";

    let {settings, onChange, dataType, dataSettings}: {
        settings: RangeFormQuestionSettings,
        onChange: (settings: RangeFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let createInput: AsyncInlineCreateInput;

    function onStepChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, step: parseInt(e.currentTarget.value)});
    }

    function onLabelAdd() {
        createInput.prompt(name => {
            onLabelsChange([...(settings.labels ?? []), {id: crypto.randomUUID(), text: name}]);
        });
    }

    function onLabelsChange(labels: RangeLabel[]) {
        onChange({...settings, labels});
    }
</script>

<div class="row-between">
    Step
    <input type="number" class="border" value={settings.step} onchange={onStepChange} min="1"/>
</div>

<div class="mt-4">
    <DndOptionList options={settings.labels ?? []} text={(label) => label.text} onChange={onLabelsChange}
                   onAdd={onLabelAdd}/>
    <AsyncInlineCreateInput class="mt-2" bind:this={createInput}/>
</div>
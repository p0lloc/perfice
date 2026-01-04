<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {RangeFormQuestionSettings, RangeLabel} from "@perfice/model/form/display/range";
    import DndOptionList from "@perfice/components/form/editor/DndOptionList.svelte";
    import ControlledInlineCreateInput from "@perfice/components/base/inline/ControlledInlineCreateInput.svelte";
    import EditRangeLabelModal from "@perfice/components/form/editor/display/range/EditRangeLabelModal.svelte";

    let {settings, onChange, dataType, dataSettings}: {
        settings: RangeFormQuestionSettings,
        onChange: (settings: RangeFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    let createInput: ControlledInlineCreateInput;
    let editLabelModal: EditRangeLabelModal;

    function onStepChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, step: parseInt(e.currentTarget.value)});
    }

    function onLabelAdd() {
        createInput.prompt(name => {
            onLabelsChange([...(settings.labels ?? []), {id: crypto.randomUUID(), text: name}]);
        });
    }

    async function onLabelEdit(label: RangeLabel) {
        return editLabelModal.open(label);
    }

    function onLabelsChange(labels: RangeLabel[]) {
        onChange({...settings, labels});
    }
</script>

<EditRangeLabelModal bind:this={editLabelModal}/>
<div class="row-between">
    Step
    <input type="number" class="border" value={settings.step} onchange={onStepChange} min="1"/>
</div>

<div class="mt-4">
    <DndOptionList options={settings.labels ?? []} text={(label) => label.text} onChange={onLabelsChange}
                   onEdit={onLabelEdit}
                   onAdd={onLabelAdd}/>
    <ControlledInlineCreateInput class="mt-2" bind:this={createInput}/>
</div>
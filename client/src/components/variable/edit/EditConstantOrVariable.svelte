<script lang="ts">
    import {type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {ConstantOrVariable} from "@perfice/services/variable/types/goal";
    import EditConstant from "@perfice/components/variable/edit/EditConstant.svelte";
    import EditVariable from "@perfice/components/variable/edit/EditVariable.svelte";
    import EditBackButton from "@perfice/components/variable/edit/EditBackButton.svelte";
    import type {EditConstantOrVariableState} from "@perfice/model/goal/ui";
    import type {FormQuestionDataType} from "@perfice/model/form/form";

    let {value, onBack, onChange, onEdit, dataType}: {
        value: ConstantOrVariable,
        onBack: () => void,
        onChange: (v: ConstantOrVariable) => void,
        onEdit: (v: EditConstantOrVariableState) => void,
        dataType?: FormQuestionDataType
    } = $props();

    function onConstantChange(v: PrimitiveValue) {
        onChange({...$state.snapshot(value), value: v});
    }

</script>

{#if value.constant || value.value.type !== PrimitiveValueType.STRING}
    <EditConstant {dataType} value={value.value} onChange={onConstantChange}/>
{:else}
    <EditVariable variableId={value.value.value} {onEdit} useDisplayValues={true}/>
{/if}
<EditBackButton {onBack}/>

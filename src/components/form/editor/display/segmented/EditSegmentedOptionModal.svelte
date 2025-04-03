<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {type DataSettingValues, questionDataTypeRegistry} from "@perfice/model/form/data";
    import type {SegmentedOption} from "@perfice/model/form/display/segmented";
    import Button from "@perfice/components/base/button/Button.svelte";
    import PrimitiveVanillaInputField from "@perfice/components/form/valueInput/PrimitiveVanillaInputField.svelte";

    let {dataType, dataSettings}: { dataType: FormQuestionDataType, dataSettings: DataSettingValues } = $props();

    let modal: Modal;
    let sameDisplayText = $state(false);
    let option: SegmentedOption = $state({} as SegmentedOption);

    let completer: (o: SegmentedOption | null) => void;

    let dataDef = $derived(questionDataTypeRegistry.getDefinition(dataType)!);
    let valueStr: string = $state("");

    export async function open(editOption: SegmentedOption | null): Promise<SegmentedOption | null> {
        let promise = new Promise<SegmentedOption | null>((resolve) => completer = resolve);

        if (editOption != null) {
            option = structuredClone(editOption);
            valueStr = dataDef.serialize(option.value);
            sameDisplayText = valueStr == option.text;
        } else {
            // Create a new option
            let defaultValue = dataDef.deserialize(dataDef.getDefaultValue(dataSettings));
            if (defaultValue == null) return promise;

            valueStr = dataDef.serialize(defaultValue);
            sameDisplayText = true;
            option = {
                id: crypto.randomUUID(),
                text: valueStr,
                value: dataDef.getDefaultValue(dataSettings),
            }
        }

        modal.open();
        return promise;
    }

    function addOtherDisplayText() {
        // Deserialize the current value as text
        let value = dataDef.deserialize($state.snapshot(valueStr)) ?? dataDef.getDefaultValue(dataSettings);
        option.text = dataDef.serialize(value);
        sameDisplayText = false;
    }

    function onValueChange(v: PrimitiveValue) {
        option.value = v;
    }

    function onConfirm() {
        let value = dataDef.deserialize($state.snapshot(valueStr));
        if (value == null) return;
        option.value = value;

        // If using same display text, copy from the value
        if (sameDisplayText) {
            option.text = dataDef.serialize(value);
        }

        completer($state.snapshot(option));
        modal.close();
    }
</script>

<Modal title="Edit option" bind:this={modal} type={ModalType.CONFIRM_CANCEL} size={ModalSize.SMALL}
       onConfirm={onConfirm} onClose={() => completer(null)}>
    <div class="flex flex-col gap-4">
        <div class="row-between">
            <span class="label">Value</span>
            <PrimitiveVanillaInputField {dataType} value={option.value} onChange={onValueChange}/>
        </div>
        <div class="row-between">
            <span class="label">Text</span>
            {#if sameDisplayText}
                <Button onClick={addOtherDisplayText}>Add other text</Button>
            {:else}
                <input type="text" bind:value={option.text} class="border"/>
            {/if}
        </div>
    </div>
</Modal>

<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import type {SelectOption} from "@perfice/model/form/display/select";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {type DataSettingValues, questionDataTypeRegistry} from "@perfice/model/form/data";
    import PrimitiveVanillaInputField from "@perfice/components/form/valueInput/PrimitiveVanillaInputField.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

    let {dataType, dataSettings}: { dataType: FormQuestionDataType, dataSettings: DataSettingValues } = $props();

    let modal: Modal;
    let option: SelectOption = $state({} as SelectOption);
    let sameDisplayText = $state(false);

    let completer: (o: SelectOption | null) => void;

    let dataDef = $derived(questionDataTypeRegistry.getDefinition(dataType)!);
    let valueStr: string = $state("");

    export async function open(editOption: SelectOption | null): Promise<SelectOption | null> {
        let promise = new Promise<SelectOption | null>((resolve) => completer = resolve);

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
                value: defaultValue,
                icon: null,
                iconAndText: false
            };
        }

        modal.open();
        return promise;
    }

    function addIcon() {
        option.icon = "";
        option.iconAndText = false;
    }

    function removeIcon() {
        option.icon = null;
        option.iconAndText = false;
    }

    function addOtherDisplayText() {
        let value = dataDef.deserialize($state.snapshot(valueStr)) ?? dataDef.getDefaultValue(dataSettings);
        option.text = dataDef.serialize(value);
        sameDisplayText = false;
    }

    function onIconChange(icon: string) {
        option.icon = icon;
    }

    function onValueChange(v: PrimitiveValue) {
        option.value = v;
    }

    function onConfirm() {
        if (sameDisplayText) {
            option.text = dataDef.serialize(option.value);
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
        <div class="row-between">
            <span class="label">Icon</span>
            {#if option.icon == null}
                <Button onClick={addIcon}>Add icon</Button>
            {:else}
                <div class="row-gap">
                    <IconPickerButton right={true} icon={option.icon} onChange={onIconChange}/>
                    <IconButton icon={faTimes} onClick={removeIcon}/>
                </div>
            {/if}
        </div>
        {#if option.icon != null}
            <div class="row-between">
                <span class="label">Show icon & text</span>
                <input type="checkbox" class="border" bind:checked={option.iconAndText}/>
            </div>
        {/if}
    </div>
</Modal>

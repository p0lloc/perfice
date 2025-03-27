<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import type {HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import {primitiveAsString, pString} from "@perfice/model/primitive/primitive";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";

    let modal: Modal;

    let option: HierarchyOption = $state({} as HierarchyOption);
    let valueStr: string = $state("");

    export async function open(editOption: HierarchyOption) {
        option = editOption;
        valueStr = primitiveAsString(option.value);
        modal.open();
    }

</script>

<Modal title="Edit option" bind:this={modal} type={ModalType.CANCEL} cancelText="Close" size={ModalSize.SMALL}>

    <div class="row-between">
        <span class="label">Value</span>
        <input type="text" class="border" bind:value={valueStr}
               onchange={(e) => option.value = pString(e.currentTarget.value)}/>
    </div>
    <div class="row-between mt-2">
        <span class="label">Text</span>
        <textarea bind:value={option.text} class="border"></textarea>
    </div>
    <div class="row-between mt-2">
        <span class="label">Grid size</span>
        <input type="number" bind:value={option.gridSize} class="border">
    </div>
    <div class="row-between mt-2">
        Color
        <ColorPickerButton value={option.color} onChange={(v) => option.color = v}/>
    </div>

</Modal>
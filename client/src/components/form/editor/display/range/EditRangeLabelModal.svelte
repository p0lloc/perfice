<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import type {RangeLabel} from "@perfice/model/form/display/range";

    let modal: Modal;
    let label: RangeLabel = $state({} as RangeLabel);

    let completer: (o: RangeLabel | null) => void;

    export async function open(editOption: RangeLabel): Promise<RangeLabel | null> {
        let promise = new Promise<RangeLabel | null>((resolve) => completer = resolve);
        label = structuredClone(editOption);

        modal.open();
        return promise;
    }

    function onConfirm() {
        completer($state.snapshot(label));
        modal.close();
    }
</script>

<Modal title="Edit label" bind:this={modal} type={ModalType.CONFIRM_CANCEL} size={ModalSize.SMALL}
       onConfirm={onConfirm} onClose={() => completer(null)}>
    <div class="flex flex-col gap-4">
        <div class="row-between">
            <span class="label">Text</span>
            <input type="text" bind:value={label.text} class="border"/>
        </div>
    </div>
</Modal>

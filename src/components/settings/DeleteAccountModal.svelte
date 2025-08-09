<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";

    let modal: Modal;
    let confirmation = $state("");

    let {onConfirm}: {
        onConfirm: () => void
    } = $props();

    const CONFIRMATION = "delete";

    export function open() {
        confirmation = "";
        modal.open();
    }

    function onConfirmed() {
        if (confirmation != CONFIRMATION) return;

        modal.close();
        onConfirm();
    }

</script>

<Modal title="Delete data" size={ModalSize.SMALL} type={ModalType.CONFIRM_CANCEL} confirmText="Delete data"
       bind:this={modal} onConfirm={onConfirmed}>
    <p>Are you sure you want to delete all your data? This action is irreversible.</p>
    <p class="py-3 font-bold">Type "{CONFIRMATION}" below to confirm.</p>
    <input bind:value={confirmation} placeholder="Confirmation" class="input w-full">
</Modal>

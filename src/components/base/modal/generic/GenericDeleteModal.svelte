<script lang="ts" generics="T">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";

    let {subject, onDelete}: { subject: string, onDelete: (t: T) => void } = $props();
    let modal: Modal;
    let deleting: T | null = null;

    export function open(toDelete: T) {
        deleting = toDelete;
        modal.open();
    }

    function onConfirm() {
        if(deleting == null) return;

        modal.close();
        onDelete(deleting);
    }
</script>

<Modal title="Confirm deletion" size={ModalSize.SMALL} type={ModalType.CONFIRM_CANCEL} confirmText="Delete" bind:this={modal} onConfirm={onConfirm}>
    Are you sure you want to delete {subject}?
</Modal>
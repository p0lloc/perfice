<script lang="ts" generics="T">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";

    let {message, title, onConfirm, confirmText}: {
        message: string,
        title: string,
        confirmText: string,
        onConfirm: (t: T) => void
    } = $props();

    let modal: Modal;
    let subject: T | null = null;

    export function open(entity: T) {
        subject = entity;
        modal.open();
    }

    function onConfirmed() {
        if (subject == null) return;

        modal.close();
        onConfirm(subject);
    }
</script>

<Modal title={title} size={ModalSize.SMALL} type={ModalType.CONFIRM_CANCEL} {confirmText}
       bind:this={modal} onConfirm={onConfirmed}>
    {message}
</Modal>

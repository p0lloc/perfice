<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";

    let modal: Modal;

    let {title, message}: {
        title: string,
        message: string
    } = $props();

    export function open() {
        modal.open();
    }

    function onConfirm() {
        modal.close();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title={title} bind:this={modal} onConfirm={onConfirm}
       confirmText="Ok" size={ModalSize.SMALL}>
    <p>{message}</p>
</Modal>
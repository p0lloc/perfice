<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";

    let modal: Modal;

    function onConfirm() {

    }

    export function open() {
        modal.open();
    }

    function close() {
        modal.close();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Forgot password" bind:this={modal} onConfirm={onConfirm}
       confirmText="Reset password"
       size={ModalSize.SMALL}>
    <div class="flex flex-col gap-4">
        <p>Enter your email address to reset your password.</p>
        <input type="text" placeholder="Email" class="input"/>
    </div>
</Modal>

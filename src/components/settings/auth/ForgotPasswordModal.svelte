<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {auth} from "@perfice/stores";

    let modal: Modal;
    let email: string = $state("");
    let success: boolean = $state(false);

    async function onConfirm() {
        success = await auth.resetPassword(email);
        email = "";
    }

    export function open() {
        email = "";
        modal.open();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Forgot password" bind:this={modal} onConfirm={onConfirm}
       confirmText="Reset password"
       size={ModalSize.SMALL}>
    <div class="flex flex-col gap-4">
        <p>Enter your email address to reset your password.</p>
        <input type="text" placeholder="Email" class="input" bind:value={email}/>
        {#if success}
            <p class="text-green-500">An email has been sent to your email address with instructions on how to reset
                your password.</p>
        {/if}
    </div>
</Modal>

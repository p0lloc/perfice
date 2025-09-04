<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {sync} from "@perfice/stores";

    let modal: Modal;
    let password = $state("");

    let {onReset, onConfirmed}: { onReset: () => void, onConfirmed: () => void } = $props();

    async function onConfirm() {
        modal.close();
        if (await sync.confirmEncryptionPassword(password)) {
            onConfirmed();
        }
    }

    function handleReset() {
        modal.close();
        onReset();
    }

    export function open() {
        password = "";
        modal.open();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Confirm encryption password" bind:this={modal} onConfirm={onConfirm}
       confirmText="Confirm password"
       size={ModalSize.MEDIUM}>

    <div class="flex flex-col gap-4">
        <p>Please enter your encryption password to synchronize your data.</p>
        <input type="password" bind:value={password} placeholder="Encryption password"/>

        <p class="mt-2 flex items-center gap-2 text-red-500 font-bold">
            If you forgot your password, you can upload your local data (all server data will be lost) with
            a new password.
        </p>
        <Button class="self-start" color={ButtonColor.RED} onClick={handleReset}>Reset password</Button>
    </div>
</Modal>

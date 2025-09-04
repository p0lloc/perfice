<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {auth, remote} from "@perfice/stores";
    import {RemoteType} from "@perfice/services/remote/remote";

    let modal: Modal;

    let email = $state("");
    let password = $state("");
    let confirm = $state("");
    let error = $state("");

    let {onRegister}: { onRegister: () => void } = $props();

    async function onConfirm() {
        if (password != confirm) {
            error = "Passwords do not match";
            return;
        }

        if (await auth.register(email, password)) {
            remote.setRemoteEnabled(RemoteType.AUTH, true);
            close();
            onRegister();
        } else {
            error = "User already exists, try logging in";
        }
    }

    export function open() {
        email = "";
        password = "";
        confirm = "";
        error = "";
        modal.open();
    }

    function close() {
        modal.close();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Register account" bind:this={modal} onConfirm={onConfirm}
       confirmText="Register"
       size={ModalSize.SMALL}>
    <div class="flex flex-col gap-2">
        <p class="text-red-500" class:hidden={error === ""}>{error}</p>
        <input type="text" bind:value={email} placeholder="Email" class="input"/>
        <input type="password" bind:value={password} placeholder="Password" class="input mt-4"/>
        <input type="password" bind:value={confirm} placeholder="Confirm password" class="input"/>
    </div>
</Modal>
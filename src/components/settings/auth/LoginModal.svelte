<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {auth, remote} from "@perfice/stores";
    import {RemoteType} from "@perfice/services/remote/remote";

    let modal: Modal;

    let {onForgotPassword}: { onForgotPassword: () => void } = $props();

    let email = $state("");
    let password = $state("");

    let registered = $state(false);
    let error = $state("");

    async function onConfirm() {
        if (await auth.login(email, password)) {
            remote.setRemoteEnabled(RemoteType.AUTH, true);
            close();
        } else {
            registered = false;
            error = "Invalid email or password";
        }
    }

    export function open(hasRegistered: boolean = false) {
        registered = hasRegistered;
        email = "";
        password = "";
        error = "";
        modal.open();
    }

    function onForgotPasswordClicked() {
        onForgotPassword();
        close()
    }

    function close() {
        modal.close();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Log in" bind:this={modal} onConfirm={onConfirm}
       confirmText="Log in"
       size={ModalSize.SMALL}>
    <div class="flex flex-col gap-4">
        {#if registered}
            <p class="text-green-500">Successfully registered, please log in.</p>
        {/if}
        <p class="text-red-500" class:hidden={error === ""}>{error}</p>
        <input type="text" bind:value={email} placeholder="Email" class="input"/>
        <input type="password" bind:value={password} placeholder="Password" class="input"/>
        <button onclick={onForgotPasswordClicked} class="text-xs self-start">Forgot your password?</button>
    </div>
</Modal>
<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {auth, remote} from "@perfice/stores";
    import {RemoteType} from "@perfice/services/remote/remote";
    import {LoginResult} from "@perfice/services/auth/auth";

    let modal: Modal;

    let {onForgotPassword}: { onForgotPassword: () => void } = $props();

    let email = $state("");
    let password = $state("");

    let registered = $state(false);
    let error = $state("");

    async function onConfirm() {
        registered = false;
        let result = await auth.login(email, password);

        switch (result) {
            case LoginResult.SUCCESS:
                remote.setRemoteEnabled(RemoteType.AUTH, true);
                close();
                break;
            case LoginResult.INVALID_CREDENTIALS:
                error = "Invalid email or password";
                break;
            case LoginResult.UNCONFIRMED_EMAIL:
                error = "Please confirm your email before logging in";
                break;
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
            <p class="text-green-500">Successfully registered, please confirm your email before logging in.</p>
        {/if}
        <p class="text-red-500" class:hidden={error === ""}>{error}</p>
        <input type="text" bind:value={email} placeholder="Email" class="input"/>
        <input type="password" bind:value={password} placeholder="Password" class="input"/>
        <button onclick={onForgotPasswordClicked} class="text-xs self-start">Forgot your password?</button>
    </div>
</Modal>
<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {auth, remote} from "@perfice/stores";
    import {RemoteType} from "@perfice/services/remote/remote";
    import {LoginResult} from "@perfice/services/auth/auth";
    import ResendConfirmation from "@perfice/components/settings/auth/login/ResendConfirmation.svelte";

    let modal: Modal;

    let {onForgotPassword}: { onForgotPassword: () => void } = $props();

    let email = $state("");
    let password = $state("");

    let loginState = $state(LoginResult.SUCCESS);
    let registered = $state(false);

    let errors = {
        [LoginResult.INVALID_CREDENTIALS]: "Invalid email or password",
        [LoginResult.UNCONFIRMED_EMAIL]: "Please confirm your email before logging in",
    }

    async function onConfirm() {
        registered = false;
        loginState = await auth.login(email, password);

        if (loginState != LoginResult.SUCCESS)
            return;

        remote.setRemoteEnabled(RemoteType.AUTH, true);
        close();
    }

    export function open(hasRegistered: boolean = false) {
        registered = hasRegistered;
        email = "";
        password = "";
        loginState = LoginResult.SUCCESS;
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

        {#if loginState !== LoginResult.SUCCESS}
            <p class="text-red-500">{errors[loginState]}</p>

            {#if loginState === LoginResult.UNCONFIRMED_EMAIL}
                <ResendConfirmation email={email}/>
            {/if}
        {/if}

        <input type="text" bind:value={email} placeholder="Email" class="input"/>
        <input type="password" bind:value={password} placeholder="Password" class="input"/>
        <button onclick={onForgotPasswordClicked} class="text-xs self-start">Forgot your password?</button>
    </div>
</Modal>
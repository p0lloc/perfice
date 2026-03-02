<script lang="ts">
    import LoginModal from "@perfice/components/settings/auth/login/LoginModal.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import ForgotPasswordModal from "@perfice/components/settings/auth/ForgotPasswordModal.svelte";
    import {auth, deletion, remote} from "@perfice/stores";
    import {ButtonColor} from "@perfice/model/ui/button";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
    import {RemoteType} from "@perfice/services/remote/remote";
    import RegisterModal from "@perfice/components/settings/auth/RegisterModal.svelte";
    import DeleteAccountModal from "@perfice/components/settings/DeleteAccountModal.svelte";
    import ThemeSettings from "./ThemeSettings.svelte";
    import SettingsTimeZone from "@perfice/components/settings/auth/SettingsTimeZone.svelte";

    let loginModal: LoginModal;
    let registerModal: RegisterModal;
    let deleteModal: DeleteAccountModal;
    let forgotPasswordModal: ForgotPasswordModal;

    function disableAccount() {
        remote.setRemoteEnabled(RemoteType.AUTH, false);
        window.location.reload();
    }

    async function deleteAccount() {
        if (!(await auth.deleteAccount())) return;

        await deletion.deleteAllData();
        window.location.reload();
    }
</script>

<LoginModal
        bind:this={loginModal}
        onForgotPassword={() => forgotPasswordModal.open()}
/>
<RegisterModal
        bind:this={registerModal}
        onRegister={() => loginModal.open(true)}
/>
<ForgotPasswordModal bind:this={forgotPasswordModal}/>
<DeleteAccountModal bind:this={deleteModal} onConfirm={deleteAccount}/>

<div>
    <RemoteSettingsSection
            remoteType={RemoteType.AUTH}
            showEnableToggle={false}
    />

    {#if $auth}
        <SettingsTimeZone/>
        <div class="flex gap-2 mt-4">
            <Button onClick={() => auth.logout()}>Log out</Button>
            <Button color={ButtonColor.RED} onClick={() => deleteModal.open()}
            >Delete account
            </Button
            >
        </div>
    {:else}
        <div class="flex gap-2 mt-2">
            <Button onClick={() => loginModal.open()}>Login</Button>
            <Button onClick={() => registerModal.open()}>Register</Button>
            {#if remote.isRemoteEnabled(RemoteType.AUTH)}
                <Button color={ButtonColor.RED} onClick={disableAccount}>
                    Disable
                </Button>
            {/if}
        </div>
    {/if}

    <div class="mt-2">
        <ThemeSettings/>
    </div>
</div>

<script lang="ts">
    import LoginModal from "@perfice/components/settings/auth/LoginModal.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import ForgotPasswordModal from "@perfice/components/settings/auth/ForgotPasswordModal.svelte";
    import {auth, remote} from "@perfice/stores";
    import {ButtonColor} from "@perfice/model/ui/button";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
    import {RemoteType} from "@perfice/services/remote/remote";
    import RegisterModal from "@perfice/components/settings/auth/RegisterModal.svelte";

    let loginModal: LoginModal;
    let registerModal: RegisterModal;
    let forgotPasswordModal: ForgotPasswordModal;

    let timeZones = Intl.supportedValuesOf('timeZone').map(tz => ({name: tz, value: tz}));

    function changeTimeZone(tz: string) {
        auth.setTimezone(tz);
    }

    function disableAccount() {
        remote.setRemoteEnabled(RemoteType.AUTH, false);
        window.location.reload();
    }
</script>

<LoginModal bind:this={loginModal} onForgotPassword={() => forgotPasswordModal.open()}/>
<RegisterModal bind:this={registerModal} onRegister={() => loginModal.open(true)}/>
<ForgotPasswordModal bind:this={forgotPasswordModal}/>

<div>
    <RemoteSettingsSection remoteType={RemoteType.AUTH} showEnableToggle={false}/>

    {#if $auth}
        <div class="flex gap-2 justify-between items-center flex-wrap mt-4">
            <h3 class="settings-label">Time zone</h3>

            <DropdownButton class="w-full md:w-auto" search={true} value={$auth.timezone}
                            onChange={changeTimeZone}
                            items={timeZones}/>
        </div>
        <div class="flex gap-2 mt-4">
            <Button onClick={() => auth.logout()}>Log out</Button>
            <Button color={ButtonColor.RED} onClick={() => loginModal.open()}>Delete account</Button>
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
</div>
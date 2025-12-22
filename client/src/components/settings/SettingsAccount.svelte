<script lang="ts">
    import LoginModal from "@perfice/components/settings/auth/LoginModal.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import ForgotPasswordModal from "@perfice/components/settings/auth/ForgotPasswordModal.svelte";
    import {auth, deletion, remote} from "@perfice/stores";
    import {ButtonColor} from "@perfice/model/ui/button";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
    import {RemoteType} from "@perfice/services/remote/remote";
    import RegisterModal from "@perfice/components/settings/auth/RegisterModal.svelte";
    import DeleteAccountModal from "@perfice/components/settings/DeleteAccountModal.svelte";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import {darkMode} from "@perfice/stores/ui/darkmode";

    let loginModal: LoginModal;
    let registerModal: RegisterModal;
    let deleteModal: DeleteAccountModal;
    let forgotPasswordModal: ForgotPasswordModal;

    let timeZones = Intl.supportedValuesOf('timeZone').map(tz => ({name: tz, value: tz}));

    function changeTimeZone(tz: string) {
        auth.setTimezone(tz);
    }

    function disableAccount() {
        remote.setRemoteEnabled(RemoteType.AUTH, false);
        window.location.reload();
    }

    async function deleteAccount() {
        if (!await auth.deleteAccount())
            return;

        await deletion.deleteAllData();
        window.location.reload();
    }
</script>

<LoginModal bind:this={loginModal} onForgotPassword={() => forgotPasswordModal.open()}/>
<RegisterModal bind:this={registerModal} onRegister={() => loginModal.open(true)}/>
<ForgotPasswordModal bind:this={forgotPasswordModal}/>
<DeleteAccountModal bind:this={deleteModal} onConfirm={deleteAccount}/>

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
            <Button color={ButtonColor.RED} onClick={() => deleteModal.open()}>Delete account</Button>
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

    <h3 class="settings-label">Theme</h3>
    <div class="mt-2">
        <SegmentedControl class="w-64" segments={[
        {
            name: "Light",
            value: false
        },
        {
            name: "Dark",
            value: true
        }
    ]} value={$darkMode} onChange={(v) => $darkMode = v}/>
    </div>
</div>
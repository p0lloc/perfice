<script lang="ts">
    import {auth, remote, sync} from "@perfice/stores.js";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {RemoteType} from "@perfice/services/remote/remote";
    import RemoteSettingsSection from "@perfice/components/settings/RemoteSettingsSection.svelte";
    import ResetEncryptionModal from "@perfice/components/sync/ResetEncryptionModal.svelte";
    import {publishToEventStore} from "@perfice/util/event";
    import {confirmEncryptionEvents} from "@perfice/stores/remote/sync";
    import OnboardSyncModal from "@perfice/components/sync/OnboardSyncModal.svelte";

    let configureEncryptionModal: ResetEncryptionModal;
    let onboardSyncModal: OnboardSyncModal;
    let enabled = $state(remote.isRemoteEnabled(RemoteType.SYNC));

    async function onEnableToggle(checked: boolean) {
        enabled = checked;
        if (checked) {
            if (await sync.onSyncEnabled()) {
                // If this is not a new user, prompt user to full push/full pull to ensure data is up to date
                // If this is a new user, verifier key will be null so the pull above will fail, and they simply get to set a password
                publishToEventStore(confirmEncryptionEvents, false);
            }
        }
    }

    function configureEncryption() {
        configureEncryptionModal.open();
    }
</script>

<ResetEncryptionModal bind:this={configureEncryptionModal}/>
<OnboardSyncModal bind:this={onboardSyncModal}/>
{#if $auth}
    <div class="settings-container">
        <RemoteSettingsSection remoteType={RemoteType.SYNC} onEnableToggle={onEnableToggle}/>
        {#if enabled}
            <div class="flex gap-2 justify-between items-center flex-wrap">
                <h3 class="settings-label">Encryption password</h3>

                <Button class="w-full md:w-auto" onClick={configureEncryption}>Set password</Button>
            </div>
        {/if}
        <div class="flex gap-2 justify-between items-center flex-wrap">
            <h3 class="settings-label">Overwrite data</h3>
            <Button class="self-start" onClick={() => onboardSyncModal.open()}>Pull/Push</Button>
        </div>
    </div>
{/if}
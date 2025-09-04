<script lang="ts">
    import {subscribeToEventStore} from "@perfice/util/event";
    import ConfirmEncryptionModal from "@perfice/components/sync/ConfirmEncryptionModal.svelte";
    import {confirmEncryptionEvents} from "@perfice/stores/remote/sync";
    import ResetEncryptionModal from "@perfice/components/sync/ResetEncryptionModal.svelte";
    import OnboardSyncModal from "@perfice/components/sync/OnboardSyncModal.svelte";

    let confirmEncryptionModal: ConfirmEncryptionModal;
    let resetEncryptionModal: ResetEncryptionModal;
    let onboardSyncModal: OnboardSyncModal;

    $effect(() => {
        subscribeToEventStore($confirmEncryptionEvents, confirmEncryptionEvents, (newKey: boolean) => {
            if (newKey) {
                resetEncryptionModal.open();
            } else {
                confirmEncryptionModal.open();
            }
        });
    });

    function onEncryptionPasswordConfirmed() {
        onboardSyncModal.open();
    }
</script>

<ResetEncryptionModal bind:this={resetEncryptionModal}/>
<OnboardSyncModal bind:this={onboardSyncModal}/>
<ConfirmEncryptionModal bind:this={confirmEncryptionModal} onReset={() => resetEncryptionModal.open()}
                        onConfirmed={onEncryptionPasswordConfirmed}/>

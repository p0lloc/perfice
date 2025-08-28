<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {deletion} from "@perfice/stores";
    import DeleteAccountModal from "@perfice/components/settings/DeleteAccountModal.svelte";

    let modal: DeleteAccountModal;

    function startDelete() {
        modal.open();
    }

    async function onDeleteData() {
        await deletion.deleteAllData();
        window.location.reload();
    }
</script>

<DeleteAccountModal bind:this={modal} onConfirm={onDeleteData}/>

<h3 class="settings-label">Delete data</h3>
<div class="row-gap mt-2">
    <Button class="md:w-auto w-full" color={ButtonColor.RED} onClick={startDelete}>Delete local data</Button>
</div>

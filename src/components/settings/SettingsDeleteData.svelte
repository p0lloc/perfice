<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import {deletion} from "@perfice/stores";

    let modal: GenericDeleteModal<string>;

    function startDelete() {
        modal.open("");
    }

    async function onDeleteData() {
        await deletion.deleteAllData();
        window.location.reload();
    }
</script>

<GenericDeleteModal bind:this={modal}
                    message="Are you sure you want to delete all your data? This action is irreversible."
                    onDelete={onDeleteData}/>

<h3 class="settings-label">Delete data</h3>
<div class="row-gap mt-2">
    <Button class="md:w-auto w-full" color={ButtonColor.RED} onClick={startDelete}>Delete all data</Button>
</div>

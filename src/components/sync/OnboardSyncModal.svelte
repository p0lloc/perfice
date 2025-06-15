<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {sync} from "@perfice/stores";

    let modal: Modal;

    async function push() {
        await sync.fullPush();
        modal.close();
    }

    async function pull() {
        await sync.fullPull(true);
        modal.close();
    }

    export function open() {
        modal.open();
    }
</script>

<Modal type={ModalType.CANCEL} title="Setup sync" bind:this={modal}
       cancelText="Ignore"
       size={ModalSize.MEDIUM}>

    <div class="flex flex-col gap-4">
        <p>Do you wish to fetch all data from the server or push your local data? This will overwrite your data.</p>
        <Button onClick={pull}>Pull server data</Button>
        <Button onClick={push}>Push local data</Button>
    </div>
</Modal>

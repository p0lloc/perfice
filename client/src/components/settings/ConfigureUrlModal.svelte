<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import Modal from "@perfice/components/base/modal/Modal.svelte";

    let modal: Modal;
    let url = $state("");

    let {onConfigure}: { onConfigure: (url: string) => void } = $props();

    function onConfirm() {
        onConfigure(url);
        modal.close();
    }

    export function open(editUrl: string) {
        url = editUrl;
        modal.open();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title="Configure service URL" bind:this={modal} onConfirm={onConfirm}
       confirmText="Set URL"
       size={ModalSize.SMALL}>

    <div class="flex flex-col gap-4">
        <p>Configure your own self-hosted URL or leave blank to use the default.</p>
        <input type="text" bind:value={url} placeholder="Using default" class="input"/>
    </div>
</Modal>

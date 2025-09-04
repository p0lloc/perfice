<script lang="ts">
    import type {ImportEvent} from "@perfice/stores/import/formEntry";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalType} from "@perfice/model/ui/modal";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import {entryImports} from "@perfice/stores";

    let event = $state<ImportEvent>();
    let modal: Modal;

    let overwrite = $state(false);

    export function open(newEvent: ImportEvent) {
        event = newEvent;
        modal?.open();
    }

    function confirm() {
        entryImports.confirmImport(overwrite);
        modal?.close();
    }

    function discard() {
        entryImports.discardImport();
    }
</script>

<Modal onConfirm={confirm} onClose={discard}
       type={event?.success ? ModalType.CONFIRM_CANCEL : ModalType.CANCEL} confirmText="Import" title="Import"
       bind:this={modal}>

    {#if event != null}
        {#if event.success}
            <p>Successfully loaded {event.entryCount} entries. <br>Do you want to overwrite the existing entries?</p>

            <div class="mt-4">
                <SegmentedControl class="w-full" value={overwrite} onChange={(v) => overwrite = v}
                                  segments={[
                {name: "Append", value: false},
                {name: "Overwrite", value: true},
                ]}/>
            </div>
        {:else}
            <p>Failed to import entries, is your file following the correct format?</p>
        {/if}
    {/if}
</Modal>

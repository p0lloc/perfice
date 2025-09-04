<script lang="ts">
    import ModalFooterContainer from "./ModalFooterContainer.svelte";
    import {
        type ModalActions,
        type ModalFooterProps,
        ModalType,
        shouldModalRenderConfirm,
        shouldModalRenderDelete
    } from "@perfice/model/ui/modal";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";

    let {
        confirmText = "Save",
        cancelText = "Cancel",
        deleteText = "Delete",
        type,
        onDelete, onConfirm, onClose
    }: ModalFooterProps & ModalActions = $props();
</script>

{#if type !== ModalType.NONE}
    <ModalFooterContainer>
        <div
                class="flex {type === ModalType.DELETE_CONFIRM_CANCEL
        ? 'justify-between'
        : 'justify-end'}"
        >
            {#if shouldModalRenderDelete(type)}
                <Button color={ButtonColor.RED} onClick={onDelete}>
                    <div class="flex gap-2 items-center">
                        {deleteText}
                    </div>
                </Button>
            {/if}
            <div class="flex gap-2">
                {#if shouldModalRenderConfirm(type)}
                    <Button onClick={onConfirm}>{confirmText}</Button>
                {/if}
                <Button color={ButtonColor.RED} onClick={onClose}>{cancelText}</Button>
            </div>
        </div>
    </ModalFooterContainer>
{/if}

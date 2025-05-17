<script lang="ts" generics="T">
    import GenericEntityModal from "@perfice/components/base/modal/generic/GenericEntityModal.svelte";

    let {subject = '', onDelete, message}: {
        subject?: string,
        message?: string,
        onDelete: (t: T) => void
    } = $props();
    let modal: GenericEntityModal<T>;

    export function open(toDelete: T) {
        modal.open(toDelete);
    }
</script>

<GenericEntityModal message={message ?? `Are you sure you want to delete ${subject}?`} title="Confirm deletion"
                    onConfirm={onDelete}
                    bind:this={modal} confirmText="Delete"/>
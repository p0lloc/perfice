<script lang="ts">
    import ModalFooter from "./ModalFooter.svelte";
    import { onDestroy, type Snippet } from "svelte";
    import {
        type ModalFooterProps,
        ModalSize,
        type ModalActions,
        closableState,
        onClosableClosed,
    } from "../../../model/ui/modal";
    import MobileModalHeader from "./MobileModalHeader.svelte";

    let {
        children,
        zIndex = 140,
        size = ModalSize.MEDIUM,
        title,
        closeWithBackground = true,

        header,
        actions,
        confirmText = "Save",
        cancelText = "Cancel",
        deleteText = "Delete",
        type,
        onDelete,
        onConfirm,
        onClose,
    }: {
        title: string;
        children: Snippet;
        zIndex?: number;
        size?: ModalSize;
        header?: Snippet;
        actions?: Snippet;
        closeWithBackground?: boolean;
    } & ModalFooterProps &
        ModalActions = $props();

    let visible = $state(false);
    let modalBackgroundContainer = $state<HTMLDivElement | null>(null);

    const SIZE_CLASSES: Record<ModalSize, string> = {
        [ModalSize.SMALL]: "2xl:w-[20%] lg:w-[40%] md:w-[50%]",
        [ModalSize.MEDIUM]: "md:w-[40%]",
    };

    export function open() {
        closableState.push(close);
        visible = true;
    }

    export function close() {
        visible = false;
        popNavigator();
        onClose?.();
    }

    function onBackgroundMousedown(e: MouseEvent) {
        if (e.target != modalBackgroundContainer || !closeWithBackground)
            return;

        // Close modal when clicking on background
        close();
    }

    function popNavigator() {
        if (!visible) return;

        onClosableClosed(close);
    }

    onDestroy(() => {
        popNavigator();
    });
</script>

{#if visible}
    <!-- svelte-ignore a11y_no_static_element_interactions (Needed for backdrop click to close modal, we also provide Close button for A11y) -->
    <div
        class="modal-bg"
        onmousedown={onBackgroundMousedown}
        bind:this={modalBackgroundContainer}
    >
        <div
            style:z-index={zIndex}
            class="w-screen h-screen md:h-auto {SIZE_CLASSES[
                size
            ]} md:rounded-lg bg-white overflow-y-auto overflow-x-hidden md:max-h-[90%] text-black flex flex-col md:justify-between"
        >
            <MobileModalHeader
                {title}
                {type}
                {onDelete}
                {onConfirm}
                onClose={close}
                extraActions={actions}
            />
            <div
                class="py-4 px-6 border-b-gray-300 border-b hidden md:flex justify-between"
            >
                <h2 class="text-2xl font-semibold">{title}</h2>
                {@render actions?.()}
            </div>
            {@render header?.()}
            <div class="p-4 md:p-6">
                {@render children?.()}
            </div>
            <ModalFooter
                {confirmText}
                {cancelText}
                {deleteText}
                {type}
                {onDelete}
                {onConfirm}
                onClose={close}
            />
        </div>
    </div>
{/if}

<style>
    .modal-bg {
        position: fixed;
        z-index: 1400;
        left: 0;
        top: 0;

        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;
        overflow: auto;

        background-color: rgb(0, 0, 0);
        background-color: rgba(0, 0, 0, 0.4);
    }
</style>

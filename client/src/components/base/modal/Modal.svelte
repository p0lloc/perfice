<script lang="ts">
    import ModalFooter from "./ModalFooter.svelte";
    import {onDestroy, type Snippet} from "svelte";
    import {
        closableState,
        type ModalActions,
        type ModalFooterProps,
        ModalSize,
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
        customFooter,
        confirmText = "Save",
        cancelText = "Cancel",
        deleteText = "Delete",
        type,
        onDelete,
        onConfirm,
        onClose,
        onKeyDown,
        onEnter,
        leftTitle = false,
    }: {
        title: string;
        children: Snippet;
        zIndex?: number;
        size?: ModalSize;
        header?: Snippet;
        actions?: Snippet;
        customFooter?: Snippet;
        closeWithBackground?: boolean;
        onEnter?: () => void;
        onKeyDown?: (e: KeyboardEvent) => void;
        leftTitle?: boolean;
    } & ModalFooterProps &
        ModalActions = $props();

    let visible = $state(false);
    let modalBackgroundContainer = $state<HTMLDivElement | null>(null);

    const SIZE_CLASSES: Record<ModalSize, string> = {
        [ModalSize.SMALL]: "2xl:w-[20%] lg:w-[40%] md:w-[50%]",
        [ModalSize.MEDIUM]: "2xl:w-[40%] md:w-[60%] ",
        [ModalSize.LARGE]: "md:w-[50%]",
    };

    export function open() {
        closableState.push(close);
        visible = true

        // Setting a timeout seems to be the easiest way to wait for the element to be mounted.
        // We could separate the container into a separate component or use an effect with change tracking, but that seems overly complicated.
        setTimeout(() => {
            if (modalBackgroundContainer == null) return;

            // Focus the BG container so we can receive keyboard events and let user tab through the modal
            modalBackgroundContainer.focus();
        });
    }

    export function close() {
        popNavigator();
        visible = false;
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

    function handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "Escape":
                close();
                break;
            case "Enter":
                if (e.target == e.currentTarget)
                    onEnter?.();

                break;
        }

        onKeyDown?.(e);
    }

    onDestroy(() => {
        popNavigator();
    });
</script>

{#if visible}
    <!-- svelte-ignore a11y_no_static_element_interactions (Needed for backdrop click to close modal, we also provide Close button for A11y) -->
    <div
            class="modal-bg"
            tabindex="-1"
            onmousedown={onBackgroundMousedown}
            onkeydown={handleKeyDown}
            bind:this={modalBackgroundContainer}
    >
        <div
                style:z-index={zIndex}
                class="w-screen h-screen md:h-auto {SIZE_CLASSES[
                size
            ]} md:rounded-lg bg-white dark:bg-gray-800 dark:text-white overflow-y-auto overflow-x-hidden
            md:max-h-[90%] text-black flex flex-col md:justify-between dark-border dark:border"
        >
            <MobileModalHeader
                    {title}
                    {type}
                    {onDelete}
                    {onConfirm}
                    onClose={close}
                    {leftTitle}
                    extraActions={actions}
            />
            <div
                    class="py-4 px-6 border-b-gray-300 dark:border-b-gray-500 border-b hidden md:flex justify-between"
            >
                <h2 class="text-2xl font-semibold">{title}</h2>
                <div class="row-gap">{@render actions?.()}</div>
            </div>

            {@render header?.()}
            <div class="p-4 md:p-6">
                {@render children?.()}
            </div>
            {@render customFooter?.()}
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
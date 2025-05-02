<script lang="ts">
    import {faArrowLeft, faCheck, faTrash} from "@fortawesome/free-solid-svg-icons";
    import {
        type ModalActions,
        ModalType,
        shouldModalRenderConfirm,
        shouldModalRenderDelete
    } from "@perfice/model/ui/modal";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import type {Snippet} from "svelte";

    let {
        title, type,
        extraActions,

        onDelete, onConfirm, onClose,
        leftTitle = false
    }: { title: string, type: ModalType, extraActions?: Snippet, leftTitle?: boolean } & ModalActions = $props();
</script>

<MobileTopBar {title} leftTitleOffset={leftTitle ? "left-12": undefined}>
    {#snippet leading()}
        <button class="icon-button" onclick={onClose}>
            <Fa icon={faArrowLeft}/>
        </button>
    {/snippet}
    {#snippet actions()}
        {@render extraActions?.()}
        {#if shouldModalRenderConfirm(type)}
            <button class="icon-button" onclick={onConfirm}>
                <Fa icon={faCheck}/>
            </button>
        {/if}
        {#if shouldModalRenderDelete(type)}
            <button class="icon-button" onclick={onDelete}>
                <Fa icon={faTrash}/>
            </button>
        {/if}
    {/snippet}
</MobileTopBar>

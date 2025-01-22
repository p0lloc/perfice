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

    let {
        title, type,

        onDelete, onConfirm, onClose
    }: { title: string, type: ModalType } & ModalActions = $props();
</script>

<MobileTopBar {title}>
    {#snippet leading()}
        <button class="icon-button" onclick={onClose}>
            <Fa icon={faArrowLeft}/>
        </button>
    {/snippet}
    {#snippet actions()}
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

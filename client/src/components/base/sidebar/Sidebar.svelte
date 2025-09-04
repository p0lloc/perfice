<script lang="ts">
    import {closableState, onClosableClosed} from "@perfice/model/ui/modal";
    import type {Snippet} from "svelte";
    import IconButton from "../button/IconButton.svelte";
    import {
        faTimes,
        type IconDefinition,
    } from "@fortawesome/free-solid-svg-icons";

    let {
        children,
        title,
        onClose = () => {
        },
        closeButtonIcon = faTimes,
        class: className = "",
    }: {
        title: string | null;
        children: Snippet;
        closeButtonIcon?: IconDefinition | null;
        class?: string;
        onClose?: () => void;
    } = $props();

    let visible = $state(false);

    export function open() {
        visible = true;
        closableState.push(close);
    }

    export function close() {
        visible = false;
        onClosableClosed(close);
        onClose();
    }
</script>

{#if visible}
    <div class="right-sidebar md:w-96 flex flex-col {className}">
        <div class="row-between text-2xl p-4 font-bold border-b">
            {#if title != null}
                <h2 class="text-3xl font-bold">{title}</h2>
            {/if}
            {#if closeButtonIcon != null}
                <IconButton
                        onClick={close}
                        icon={closeButtonIcon}
                        class="text-gray-500 text-xl"
                />
            {/if}
        </div>
        {@render children()}
    </div>
{/if}

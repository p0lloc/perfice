<script lang="ts">
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import { onMount } from "svelte";
    import Fa from "svelte-fa";

    let {
        confirm,
    }: {
        confirm: () => void;
    } = $props();

    const HIDE_ELEMENTS = ["input", "textarea", "select"];
    let visible = $state(true);

    onMount(() => {
        const handleFocusIn = (e: FocusEvent) => {
            let target = e.target as HTMLElement | null;
            visible = !HIDE_ELEMENTS.includes(
                target?.tagName?.toLowerCase() ?? "",
            );
        };

        document.addEventListener("focusin", handleFocusIn);

        return () => {
            document.removeEventListener("focusin", handleFocusIn);
        };
    });
</script>

{#if visible}
    <button
        onclick={confirm}
        class="md:hidden z-10 fixed bottom-0 w-screen h-20 bg-green-500 flex-center
    pointer-feedback:bg-green-600 text-white left-0"
    >
        <Fa icon={faCheck} size="2.0x" />
    </button>
{/if}

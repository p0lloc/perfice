<script lang="ts">
    import type {Snippet} from "svelte";
    import {ButtonColor} from "../../../model/ui/button";

    let {onClick, children, color = ButtonColor.GREEN, class: className = ''}: {
        color?: ButtonColor,
        onClick?: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void,
        children: Snippet,
        class?: string,
    } = $props();

    const BUTTON_COLOR_CLASSES: Record<ButtonColor, string> = {
        [ButtonColor.GREEN]: "bg-green-600 pointer-feedback:bg-green-700 text-white",
        [ButtonColor.RED]: "bg-red-600 pointer-feedback:bg-red-700 text-white",
        [ButtonColor.WHITE]: "bg-white pointer-feedback:bg-gray-100 border"
    }
</script>

<button class="{BUTTON_COLOR_CLASSES[color]} font-bold {className}" onclick={onClick}>
    {@render children()}
</button>
<style>
    button {
        border-radius: 5px;
        padding: 0 12px;
        min-height: 36px;
        line-height: 36px;
    }
</style>

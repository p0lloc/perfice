<script lang="ts">
    import type {Snippet} from "svelte";
    import {ButtonColor} from "../../../model/ui/button";

    let {onClick, children, color = ButtonColor.GREEN}: {
        color?: ButtonColor,
        onClick?: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void,
        children: Snippet
    } = $props();

    const BUTTON_COLOR_CLASSES: Record<ButtonColor, string> = {
        [ButtonColor.GREEN]: "bg-green-600 hover:bg-green-700 text-white",
        [ButtonColor.RED]: "bg-red-600 hover:bg-red-700 text-white",
        [ButtonColor.WHITE]: "bg-white hover:bg-gray-100 border"
    }
</script>

<button class="{BUTTON_COLOR_CLASSES[color]} font-bold " onclick={onClick}>
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

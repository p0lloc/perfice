<script lang="ts">
    import type {HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import {sanitizeColor} from "@perfice/util/color";

    let {option, onClick, selected}: { option: HierarchyOption, onClick: () => void, selected: boolean } = $props();
</script>

<button class="flex-col-center aspect-square rounded-xl border-2 border-transparent " class:selected={selected}
        style:background-color={sanitizeColor(option.color)}
        onclick={onClick}>
    <p class="whitespace-pre-line text-center overflow-hidden text-ellipsis w-full text-sm md:text-base">{option.text}</p>
</button>

<style>
    .selected {
        @apply border-green-600;
    }
</style>

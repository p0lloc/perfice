<script lang="ts">
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type {SelectOption} from "@perfice/model/form/display/select";

    let {option, selected, onClick, grid, unit}: {
        option: SelectOption,
        selected: boolean,
        onClick: () => void,
        grid: boolean,
        unit?: string
    } = $props();
</script>

<button class="border-2 p-2 rounded-xl aspect-square flex flex-col justify-center items-center"
        class:w-24={!grid}
        class:selected={selected}
        onclick={onClick}
>
    {#if option.icon != null}
        <Icon class="text-4xl" name={option.icon}/>
    {/if}
    {#if option.icon == null || option.iconAndText}
        <span class="whitespace-nowrap overflow-hidden w-full text-xs">{option.text} {unit ?? ""}</span>
    {/if}
</button>

<style>
    .selected {
        @apply border-2 border-green-500 bg-green-50;
    }
</style>

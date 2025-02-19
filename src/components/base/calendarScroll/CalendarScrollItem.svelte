<script lang="ts">
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";

    let {value, selectedValue, onClick}: { value: Date, selectedValue: Date, onClick: () => void } = $props();

    let selected = $derived(selectedValue.getTime() == value.getTime());
</script>

<button
        onclick={onClick}
        class="hover-feedback flex w-10 h-10 md:h-full h-full md:w-12 flex-1 md:flex-initial flex-col aspect-square
        justify-center items-center px-4 py-2 text-xs md:rounded-md md:border
	bg-white {selected ? 'md:border-green-500 text-green-500' : 'md:border'}"
>
    <span class="text-[10px] font-bold ">{WEEK_DAYS_SHORT[value.getDay()]}</span>
    {value.getDate()}
</button>

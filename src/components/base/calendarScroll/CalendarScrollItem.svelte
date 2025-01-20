<script lang="ts">
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";

    let {value, selectedValue, onClick}: { value: Date, selectedValue: Date, onClick: () => void } = $props();

    let selected = $derived(selectedValue.getTime() == value.getTime());
</script>

<button
        onclick={onClick}
        class="hover:bg-gray-100 flex w-[53px] h-[52px] flex-col justify-center items-center px-4 py-2 text-xs rounded-md border
	bg-white {selected ? 'border-2 border-green-500' : 'border'}"
>
    <span class="text-[10px] font-bold">{WEEK_DAYS_SHORT[value.getDay()]}</span>
    {value.getDate()}
</button>

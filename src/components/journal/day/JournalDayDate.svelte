<script lang="ts">
    import {MONTHS_SHORT} from "@perfice/util/time/format";

    let {date, dayOfMonth, weekDay}: { date: Date, dayOfMonth: string, weekDay: string } = $props();
</script>

<div
        class="border p-4 bg-gray-50 md:inline-block text-center md:w-24 rounded-xl hidden"
>
    <p class="text text-[11px] font-bold">
        {MONTHS_SHORT[date.getMonth()]}
    </p>
    <b class="text-xl">{dayOfMonth}</b>
    <p class="text-gray-400 text-[10px]">{weekDay.toUpperCase()}</p>
</div>

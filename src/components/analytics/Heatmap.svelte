<script lang="ts">
    import {dateToMidnight, dateToWeekStart} from "@perfice/util/time/simple";
    import {weekStart} from "@perfice/stores";

    const DAY_MS = 1000 * 60 * 60 * 24;

    let {values, date}: { values: Map<number, number>, date: Date } = $props();

    let range = $derived(values.size);

    let actualStart = $derived(new Date(date.getTime() - range * DAY_MS));
    let start = $derived(dateToMidnight(dateToWeekStart(actualStart, $weekStart)).getTime());

    function getColor(i: number, values: Map<number, number>) {
        let val = values.get(start + (i * DAY_MS));
        if (val == null) return "bg-gray-200";

        return val == 1 ? "bg-green-500" : "bg-gray-200";
    }
</script>

<div class="flex justify-between">
    <div class="grid-container flex-1">
        {#each Array(Math.ceil(values.size / 7) * 7 + actualStart.getDay() + 1) as _, i}
            <div class="{getColor(i, values)} aspect-square rounded">
            </div>
        {/each}
    </div>
</div>

<style>
    .grid-container {
        display: grid;
        grid-template-rows: repeat(7, min-content); /* Max 7 rows */
        grid-auto-flow: column; /* Fill rows first, then move to a new column */
        gap: 4px; /* Adjust spacing */
    }
</style>
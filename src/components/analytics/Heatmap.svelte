<script lang="ts">
    import {dateToMidnight, dateToWeekStart} from "@perfice/util/time/simple";
    import {WeekStart} from "@perfice/model/variable/time/time";

    let day = 1000 * 60 * 60 * 24;

    let v = new Map();
    let range = 30;
    let actualStart = new Date(new Date().getTime() - range * day);
    let start = dateToMidnight(dateToWeekStart(actualStart, WeekStart.SUNDAY)).getTime();
    for (let i = 0; i < range; i++) {
        v.set(dateToMidnight(new Date()).getTime() - day * i, Math.round(Math.random()));
    }

    function getColor(i: number, v: Map<number, number>) {
        let val = v.get(start + (i * day));
        if (val == null) return "";

        return val == 1 ? "bg-green-500" : "bg-gray-200";
    }
</script>

<div class=" flex justify-between">
    <div class="flex-col flex mt-4 h-28 justify-between text-xs">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
    </div>
    <div class="grid-container">
        {#each Array(Math.ceil(v.size / 7) * 7 + actualStart.getDay()) as _, i}
            <div class="{getColor(i, v)} aspect-square rounded" style="width: 16px;">
            </div>
        {/each}
    </div>
</div>

<style>
    .grid-container {
        display: inline-grid;
        grid-template-rows: repeat(7, min-content); /* Max 7 rows */
        grid-auto-flow: column; /* Fill rows first, then move to a new column */
        gap: 6px; /* Adjust spacing */
    }
</style>
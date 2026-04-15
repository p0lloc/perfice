<script lang="ts">
    import Fa from "svelte-fa";
    import {faChevronLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
    import {MONTHS_SHORT} from "@perfice/util/time/format";

    let {weekStart, weekEnd, onPrev, onNext}: {
        weekStart: Date;
        weekEnd: Date;
        onPrev: () => void;
        onNext: () => void;
    } = $props();

    function formatWeekRange(start: Date, end: Date): string {
        let startMonth = MONTHS_SHORT[start.getMonth()];
        let endMonth = MONTHS_SHORT[end.getMonth()];
        let startDay = start.getDate();
        let endDay = end.getDate();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} – ${endDay}`;
        }
        return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
    }
</script>

<div class="flex items-center justify-between py-2">
    <button onclick={onPrev} class="p-2 rounded-lg hover-feedback">
        <Fa icon={faChevronLeft} class="text-gray-500 dark:text-gray-400 text-sm"/>
    </button>
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {formatWeekRange(weekStart, weekEnd)}
    </span>
    <button onclick={onNext} class="p-2 rounded-lg hover-feedback">
        <Fa icon={faChevronRight} class="text-gray-500 dark:text-gray-400 text-sm"/>
    </button>
</div>

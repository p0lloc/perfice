<script lang="ts">
    import {createDefaultWeekDays} from "@perfice/services/variable/types/goalStreak";
    import {WEEK_DAYS_SHORT} from "@perfice/util/time/format";

    let {value, onChange}: { value: number[] | null, onChange: (weekDays: number[]) => void } = $props();

    function onWeekDayChange(index: number) {
        if (value == null) {
            onChange(createDefaultWeekDays().filter(v => v != index));
            return;
        }

        let checked = value.includes(index);
        if (checked) {
            onChange(value.filter(v => v != index));
        } else {
            onChange([...value, index]);
        }
    }
</script>

<div class="flex gap-2 items-center">
    {#each Array(7) as _, i}
        <div class="flex flex-col items-center">
            <input type="checkbox" checked={value == null || value.includes(i)}
                   onchange={() => onWeekDayChange(i)}/>
            {WEEK_DAYS_SHORT[i][0]}
        </div>
    {/each}
</div>
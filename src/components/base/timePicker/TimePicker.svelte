<script lang="ts">
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

    const MAX_MINUTE = 60;

    function getMaxHour(day: boolean) {
        return day ? 24 : 40;
    }

    let {time, disabled = false, day = false, onChange}: {
        time: number,
        disabled?: boolean,
        day?: boolean,
        onChange: (v: number) => void
    } = $props();

    let hours = $derived(Math.floor(time / 60));
    let minutes = $derived(time % 60);


    function formatDayText(value: number) {
        return value.toString().padStart(2, "0");
    }

    function getHourText(value: number, day: boolean) {
        if (day) {
            return formatDayText(value);
        }

        let result = `${value}hr`;

        if (value != 1) result += "s";

        return result;
    }

    function getMinuteText(value: number, day: boolean) {
        if (day) {
            return value.toString().padStart(2, "0");
        }

        return `${value}min`;
    }

    function mapArrayIndex<V>(array: V[], nameFunction: (index: number) => string) {
        return array.map((_, value) => {
            return {
                name: nameFunction(value),
                value
            }
        })
    }

    function onHoursChanged(hours: number) {
        onChange(calculateTime(hours, minutes));
    }

    function onMinuteChanged(minutes: number) {
        onChange(calculateTime(hours, minutes));
    }

    function calculateTime(hours: number, minutes: number) {
        return hours * 60 + minutes;
    }

    let hourDropdown = $derived<DropdownMenuItem<number>[]>(mapArrayIndex(new Array(getMaxHour(day)).fill(0),
        (v) => getHourText(v, day)));
    let minuteDropdown = $derived<DropdownMenuItem<number>[]>(mapArrayIndex(new Array(MAX_MINUTE).fill(0),
        (v) => getMinuteText(v, day)));
</script>

<div class="flex items-center">
    <DropdownButton {disabled} items={hourDropdown} value={hours} onChange={onHoursChanged}
                    class="rounded-br-none rounded-tr-none min-w-24"/>
    <DropdownButton {disabled} items={minuteDropdown} value={minutes} onChange={onMinuteChanged}
                    class="rounded-tl-none rounded-bl-none min-w-24"/>
</div>

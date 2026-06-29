<script lang="ts">
    import { Capacitor } from "@capacitor/core";
    import DatePicker from "@perfice/components/base/datePicker/DatePicker.svelte";
    import {
        formatDateHHMM,
        formatDateYYYYMMDDHHMMSS,
    } from "@perfice/util/time/format";
    import type { ChangeEventHandler } from "svelte/elements";
    import VanillaDateTimePicker from "./VanillaDateTimePicker.svelte";

    let {
        value,
        onChange,
        inputClasses,
        displayFormat,
    }: {
        value: Date;
        onChange: (v: Date) => void;
        inputClasses?: string;
        displayFormat?: string;
    } = $props();

    function onDatePick(date: string | string[] | null) {
        if (date == null || typeof date != "string") return;

        onChange(new Date(date));
    }
</script>

<div class="md:block hidden">
    <DatePicker
        time={true}
        disabled={false}
        {inputClasses}
        {displayFormat}
        value={formatDateYYYYMMDDHHMMSS(value)}
        onChange={onDatePick}
    />
</div>
<VanillaDateTimePicker {value} {onChange} />

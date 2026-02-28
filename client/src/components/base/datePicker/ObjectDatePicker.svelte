<script lang="ts">
    import DatePicker from "@perfice/components/base/datePicker/DatePicker.svelte";
    import {formatDateYYYYMMDDHHMMSS} from "@perfice/util/time/format";

    let {value, onChange, inputClasses, displayFormat}: {
        value: Date,
        onChange: (v: Date) => void,
        inputClasses?: string,
        displayFormat?: string
    } = $props();

    function onDatePick(date: string | string[] | null) {
        if (date == null || typeof date != "string") return;

        onChange(new Date(date));
    }
</script>

<DatePicker time={true} disabled={false} inputClasses={inputClasses}
            {displayFormat}
            value={formatDateYYYYMMDDHHMMSS(value)} onChange={onDatePick}/>
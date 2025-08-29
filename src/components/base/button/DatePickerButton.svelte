<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCalendar} from "@fortawesome/free-solid-svg-icons";
    import SveltyPicker from "svelty-picker";
    import {formatDateYYYYMMDD} from "@perfice/util/time/format";

    let {onDatePick, date}: { onDatePick: (date: Date | null) => void, date: Date | null } = $props();

    let visible = $state(false);

    function openDatePicker() {
        visible = true;
    }

    function onChange(date: string | string[] | null) {
        if (date != null && typeof date != "string") return;
        visible = false;
        onDatePick(date != null ? new Date(date) : null);
    }
</script>

<div>
    {#if visible}
        <div class="absolute">
            <SveltyPicker
                    mode={"date"}
                    format="yyyy-mm-dd"
                    value={date != null ? formatDateYYYYMMDD(date) : undefined}
                    pickerOnly={true}
                    inputClasses="invisible w-0"
                    inputId="date-picker"
                    onChange={onChange}
            />
        </div>
    {/if}
    <Button onClick={openDatePicker} color={ButtonColor.WHITE} class="hidden md:flex items-center gap-2">
        {date != null ? formatDateYYYYMMDD(date) : "Date"}
        <Fa icon={faCalendar}/>
    </Button>
</div>

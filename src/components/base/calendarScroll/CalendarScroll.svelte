<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {
        faCalendarAlt,
        faChevronLeft,
        faChevronRight,
    } from "@fortawesome/free-solid-svg-icons";
    import {addDaysDate, dateToMidnight, getDaysDifference} from "@perfice/util/time/simple";
    import CalendarScrollItem from "@perfice/components/base/calendarScroll/CalendarScrollItem.svelte";

    let {value, onChange}: { value: Date, onChange: (value: Date) => void } = $props();
    let datePickerElement: HTMLInputElement | undefined = $state();

    // How many dates we want to show
    const DAY_RANGE = 5;

    let todayDate = dateToMidnight(new Date());
    let endDate = $state(todayDate);

    function left() {
        endDate = addDaysDate(endDate, -5);
    }

    function right() {
        // Don't allow going into the future, this is for mobile where we're not hiding the button
        if (endDate.getTime() == todayDate.getTime()) return;
        endDate = addDaysDate(endDate, 5);
    }

    function openDatePicker() {
        datePickerElement?.showPicker();
    }

    function onDatePickerChange(e: { currentTarget: HTMLInputElement }) {
        let pickedDate = dateToMidnight(new Date());
        let parsed = new Date(e.currentTarget.value); // Date parsing returns date in UTC, we want in local time.
        pickedDate.setFullYear(parsed.getFullYear());
        pickedDate.setMonth(parsed.getMonth());
        pickedDate.setDate(parsed.getDate());
        if (pickedDate.getTime() > todayDate.getTime()) return;

        let offset = getDaysDifference(todayDate, parsed) % 5;
        endDate = addDaysDate(pickedDate, offset);
        onChange(pickedDate);
    }

    // List of dates from today-(range) to today
    let dates: Date[] = $derived(
        Array<Date>(DAY_RANGE)
            .fill(new Date(0))
            .map((_, i) => addDaysDate(endDate, -(DAY_RANGE - 1 - i)))
    );

    let atEnd = $derived(endDate.getTime() == todayDate.getTime());
</script>

<div class="flex items-center md:flex-wrap justify-center gap-2 md:border-0 border px-4 md:px-0 w-full rounded-xl md:w-auto md:h-12 h-10 overflow-hidden bg-white md:bg-inherit">
    <button onclick={left} class="mr-3">
        <Fa icon={faChevronLeft}/>
    </button>

    <div class="flex items-center md:gap-2 md:flex-initial flex-1 h-full">
        {#each dates as date }
            <CalendarScrollItem
                    onClick={() => onChange(date)}
                    selectedValue={value}
                    value={date}
            />
        {/each}
    </div>
    <div class="md:w-10 flex items-center">
        <button onclick={right} class="ml-3" class:hidden={atEnd}>
            <Fa icon={faChevronRight}/>
        </button>
        {#if atEnd}
            <div class="md:flex items-center justify-center">
                <input
                        type="date"
                        class="invisible"
                        style="width: 0; height: 0; padding: 0"
                        onchange={onDatePickerChange}
                        bind:this={datePickerElement}
                />
                <button
                        onclick={openDatePicker}
                        class="bg-white md:p-2 py-2 md:border rounded-full pointer-feedback:bg-gray-100 md:ml-2"
                >
                    <Fa icon={faCalendarAlt}/>
                </button>
            </div>
        {/if}
    </div>
</div>

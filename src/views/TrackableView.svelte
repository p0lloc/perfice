<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {trackableDate, weekStart} from "@perfice/main";
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";

    function onDateChange(e: Date) {
        $trackableDate = e;
    }
</script>

<div class="mx-auto w-full md:w-1/2 md:px-0 px-4 py-10">
    <div class="flex flex-wrap justify-center md:gap-0 gap-2 md:justify-between mb-8 items-center">
        <h1 class="text-4xl font-bold text-center">Trackables</h1>
        <CalendarScroll value={$trackableDate} onChange={onDateChange}/>
    </div>

    <TrackableList date={$trackableDate} weekStart={$weekStart}/>
</div>

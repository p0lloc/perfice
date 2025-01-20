<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {trackableDate, weekStart} from "@perfice/main";
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";

    function onDateChange(e: Date) {
        $trackableDate = e;
    }
</script>

<div class="mx-auto w-1/2 py-10">
    <div class="flex justify-end">
        <CalendarScroll value={$trackableDate} onChange={onDateChange}/>
    </div>
    <TrackableList date={$trackableDate} weekStart={$weekStart}/>
</div>

<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {trackableDate, weekStart} from "@perfice/main";
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";

    function onDateChange(e: Date) {
        $trackableDate = e;
    }
</script>

<div class="mx-auto w-screen md:w-1/2 md:px-0 px-4 py-10">
    <TitleAndCalendar date={$trackableDate} onDateChange={onDateChange} title="Trackables"/>

    <TrackableList date={$trackableDate} weekStart={$weekStart}/>
</div>

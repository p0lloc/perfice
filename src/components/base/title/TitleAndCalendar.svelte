<script lang="ts">
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";

    let {date, onDateChange, title}: { date: Date, onDateChange: (date: Date) => void, title: string } = $props();
</script>
<div class="flex flex-wrap justify-center md:gap-0 gap-2 md:justify-between mb-8 items-center">
    <h1 class="text-4xl font-bold text-center">{title}</h1>
    <CalendarScroll value={date} onChange={onDateChange}/>
</div>

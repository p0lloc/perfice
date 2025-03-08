<script lang="ts">
    import CalendarScroll from "@perfice/components/base/calendarScroll/CalendarScroll.svelte";
    import {faCalendar, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";

    let {date, onDateChange, title, icon = faCalendar}: {
        date: Date,
        onDateChange: (date: Date) => void,
        title: string,
        icon?: IconDefinition
    } = $props();
</script>
<div class="flex flex-wrap justify-center md:gap-0 gap-2 md:justify-between mb-8 items-center w-full">
    <Title {title} {icon}/>
    <CalendarScroll value={date} onChange={onDateChange}/>
</div>

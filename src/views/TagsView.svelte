<script lang="ts">
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import {tagDate} from "@perfice/main";
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import TagCard from "@perfice/components/tag/TagCard.svelte";

    function onDateChange(e: Date) {
        $tagDate = e;
    }
</script>
<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar date={$tagDate} onDateChange={onDateChange} title="Tags"/>

    <div class="flex flex-wrap gap-2">
        <TagCard tag={{id: "test", name: "test"}}/>
    </div>

</div>

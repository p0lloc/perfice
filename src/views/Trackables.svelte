<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {trackableDate, weekStart} from "@perfice/main";
    import {formatDateYYYYMMDD} from "@perfice/util/time/format.js";

    let valueStr = $derived(formatDateYYYYMMDD($trackableDate));

    function onDateChange(e: Event & { currentTarget: HTMLInputElement }) {
        $trackableDate = new Date(e.currentTarget.value);
    }
</script>

<div class="mx-auto w-1/2 py-10">
    <input type="date" value={valueStr} onchange={onDateChange}/>
    <TrackableList date={$trackableDate} weekStart={$weekStart}/>
</div>

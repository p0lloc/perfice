<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
    import {variable} from "@perfice/main";
    import {prettyPrintPrimitive} from "@perfice/model/primitive/primitive";

    let {trackable}: {trackable: Trackable} = $props();

    let res = variable("test", tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0));
</script>

<div class="bg-white p-2 border">
    {trackable.name}

    {#await $res}
        Loading...
    {:then value}
        {prettyPrintPrimitive(value)}
    {/await}
</div>

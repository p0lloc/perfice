<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
    import {journal, variable} from "@perfice/main";
    import {prettyPrintPrimitive, PrimitiveValueType} from "@perfice/model/primitive/primitive";

    let {trackable}: { trackable: Trackable } = $props();

    let res = variable("test", tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0));
</script>

<div class="bg-white p-2 border">
    {trackable.name}

    {#await $res}
        Loading...
    {:then value}
        {#if value.type === PrimitiveValueType.LIST}
            {#each value.value as v}
                {#if v.type === PrimitiveValueType.ENTRY}
                    <button class="block" onclick={() => journal.deleteEntryById(v.value.id)}>
                        {v.value.id}
                    </button>
                {/if}
            {/each}
        {/if}
    {/await}
</div>

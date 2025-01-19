<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
    import {journal, variable} from "@perfice/main";
    import {pNumber, prettyPrintPrimitive} from "@perfice/model/primitive/primitive";

    let {trackable}: { trackable: Trackable } = $props();

    let res = variable(trackable.id, tSimple(SimpleTimeScopeType.DAILY, WeekStart.MONDAY, 0));
    async function createEntry(){
        await journal.logEntry({
            id: crypto.randomUUID(),
            formId: trackable.id,
            timestamp: 0,
            answers: {
                "test": pNumber(parseInt(prompt("Value") ?? "0"))
            }
        })
    }
</script>

<div class="bg-white p-2 border">
    {trackable.name}

    {#await $res}
        Loading...
    {:then value}
        <div class="border p-2">
            {prettyPrintPrimitive(value)}

            <button onclick={createEntry}>Log</button>
        </div>
    {/await}
</div>

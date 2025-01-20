<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {SimpleTimeScopeType, tSimple, WeekStart} from "@perfice/model/variable/time/time";
    import {journal, variable} from "@perfice/main";
    import {pNumber, prettyPrintPrimitive} from "@perfice/model/primitive/primitive";
    import {onDestroy} from "svelte";
    import {unregisterKey} from "@perfice/stores/variable/value";

    let {trackable, date, weekStart}: { trackable: Trackable, date: Date, weekStart: WeekStart } = $props();

    let cardId = crypto.randomUUID();
    let res = $derived(variable(trackable.id, tSimple(SimpleTimeScopeType.DAILY, weekStart, date.getTime()), cardId));

    async function createEntry() {
        await journal.logEntry({
            id: crypto.randomUUID(),
            formId: trackable.id,
            timestamp: date.getTime(),
            answers: {
                "test": pNumber(parseInt(prompt("Value") ?? "0"))
            }
        })
    }

    onDestroy(() => unregisterKey(cardId));
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

<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {journal, trackableValue} from "@perfice/main";
    import {pNumber, prettyPrintPrimitive} from "@perfice/model/primitive/primitive";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";

    let {trackable, date, weekStart}: { trackable: Trackable, date: Date, weekStart: WeekStart } = $props();

    let cardId = crypto.randomUUID();
    let res = $derived(trackableValue(trackable, date, weekStart, cardId));

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

    onDestroy(() => disposeCachedStoreKey(cardId));
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

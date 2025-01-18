<script lang="ts">
    import {journal, trackables} from "@perfice/main";
    import TrackableCard from "@perfice/components/trackable/TrackableCard.svelte";
    import {pNumber} from "@perfice/model/primitive/primitive";

    async function createTrackable(){
        await trackables.createTrackable({
            id: crypto.randomUUID(),
            name: "testing",
            formId: "test"
        })
    }
    async function createEntry(){
        await journal.logEntry({
            id: crypto.randomUUID(),
            formId: "test",
            timestamp: 0,
            answers: {
                "test": pNumber(10.0)
            }
        })
    }
</script>

{#await $trackables}
    Loading...
{:then trackables}
    {#each trackables as trackable}
        <TrackableCard {trackable}/>
    {/each}

    <button onclick={createTrackable}>Create trackable</button>
    <button onclick={createEntry}>Create entry</button>
{/await}

<script lang="ts">
    import {trackables} from "@perfice/main";
    import TrackableCard from "@perfice/components/trackable/TrackableCard.svelte";

    async function createTrackable(){
        let trackableId = crypto.randomUUID();
        await trackables.createTrackable({
            id: trackableId,
            name: "testing",
            formId: trackableId
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
{/await}

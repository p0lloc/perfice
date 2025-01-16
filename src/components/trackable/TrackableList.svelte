<script lang="ts">
    import {trackables} from "@perfice/main";
    import TrackableCard from "@perfice/components/trackable/TrackableCard.svelte";

    async function create(){
        await trackables.createTrackable({
            id: crypto.randomUUID(),
            name: "testing"
        })
    }
</script>

{#await $trackables}
    Loading...
{:then trackables}
    {#each trackables as trackable}
        <TrackableCard {trackable}/>
    {/each}

    <button onclick={create}>Create trackable</button>
{/await}

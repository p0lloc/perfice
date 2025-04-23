<script lang="ts">
    import Heatmap from "@perfice/components/analytics/Heatmap.svelte";
    import {getAnalyticsDetailsLink} from "@perfice/model/analytics/ui";
    import {tagAnalytics} from "@perfice/stores";

    let res = $derived(tagAnalytics());
</script>

<div class="grid-cols-1 md:grid-cols-4 grid gap-4 mt-4">
    {#await $res}
        Loading...
    {:then data}
        {#each data.results as value(value.tag.id)}
            <div class="bg-white rounded p-4 border">
                <p><a href={getAnalyticsDetailsLink("tag", value.tag.id)}
                      class="text-xl font-bold text-green-600">{value.tag.name}</a></p>
                <div class="mt-4">
                    <Heatmap date={data.date} values={value.values}/>
                </div>
            </div>
        {/each}
    {/await}
</div>

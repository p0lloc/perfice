<script lang="ts">
    import type {CorrelationDisplay} from "@perfice/services/analytics/display";
    import CorrelationMessagePart from "@perfice/components/analytics/details/CorrelationMessagePart.svelte";

    let {display, positive}: { display: CorrelationDisplay, positive: boolean } = $props();
</script>

<p class="mb-2 flex items-center gap-1 flex-wrap text-sm">
    <CorrelationMessagePart part={display.first} positive={positive}/>
    {display.between}
    <CorrelationMessagePart part={display.second} positive={true}/>
</p>
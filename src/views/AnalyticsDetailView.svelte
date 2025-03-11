<script lang="ts">

    import {type Component, onMount} from "svelte";
    import AnalyticsTrackableDetailsView
        from "@perfice/components/analytics/details/AnalyticsTrackableDetailsView.svelte";

    let {params}: { params: Record<string, string> } = $props();

    let entityType = $state("");
    let entityId = $state("");

    onMount(() => {
        let subject = params.subject;
        if (subject == null) return;

        let parts = subject.split(":");
        if (parts.length != 2) return;

        entityType = parts[0];
        entityId = parts[1];
    });

    const VIEWS: Record<string, Component<{ id: string }>> = {
        "trackable": AnalyticsTrackableDetailsView
    }

    const RendererComponent = $derived(VIEWS[entityType]);
</script>

<div class="main-content mx-auto md:w-1/2 p-4 md:p-0">
    {#if RendererComponent != null}
        <RendererComponent id={entityId}/>
    {/if}
</div>

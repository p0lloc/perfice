<script lang="ts">
    import {type Component, onMount} from "svelte";
    import AnalyticsTrackableDetailsView
        from "@perfice/components/analytics/details/trackable/AnalyticsTrackableDetailsView.svelte";
    import AnalyticsTagDetailsView from "@perfice/components/analytics/details/tag/AnalyticsTagDetailsView.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";

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
        "trackable": AnalyticsTrackableDetailsView,
        "tag": AnalyticsTagDetailsView
    }

    const RendererComponent = $derived(VIEWS[entityType]);
</script>

<MobileTopBar title="Analytics"/>
<div class="main-content center-view p-4 md:px-0">
    {#if RendererComponent != null}
        <RendererComponent id={entityId}/>
    {/if}
</div>

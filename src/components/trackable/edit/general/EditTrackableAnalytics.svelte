<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import AnalyticsTrackableDetailsView
        from "@perfice/components/analytics/details/trackable/AnalyticsTrackableDetailsView.svelte";

    let {editState, close}: { editState: EditTrackableState, close: () => void } = $props();
</script>

<AnalyticsTrackableDetailsView id={editState.trackable.id}/>
<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import IntegrationEditorView from "@perfice/views/integration/IntegrationEditorView.svelte";

    let {editState}: { editState: EditTrackableState, close: () => void } = $props();
</script>

<IntegrationEditorView formId={editState.trackable.formId}/>
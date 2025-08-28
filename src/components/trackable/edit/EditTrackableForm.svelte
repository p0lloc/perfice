<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import FormEditor from "@perfice/views/form/FormEditor.svelte";

    let {editState}: { editState: EditTrackableState, close: () => void } = $props();
</script>

<FormEditor headless={true} form={editState.form} creating={null}/>

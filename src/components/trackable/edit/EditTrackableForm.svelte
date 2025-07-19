<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import FormEditor from "@perfice/views/form/FormEditor.svelte";

    let {editState, close}: { editState: EditTrackableState, close: () => void } = $props();
    let viewComponent: any;

    export async function save() {
        await viewComponent.save();
    }
</script>

<FormEditor bind:this={viewComponent} headless={true} form={editState.form} creating={null}/>

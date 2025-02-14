<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import InvertedSegmentedControl from "@perfice/components/base/invertedSegmented/InvertedSegmentedControl.svelte";
    import type {Component} from "svelte";
    import {type EditTrackableState, TrackableEditViewType} from "@perfice/model/trackable/ui";
    import EditTrackableGeneral from "@perfice/components/trackable/modals/edit/EditTrackableGeneral.svelte";
    import EditTrackableIntegration from "@perfice/components/trackable/modals/edit/EditTrackableIntegration.svelte";
    import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";
    import {trackables} from "@perfice/main";
    import {goto} from "@mateothegreat/svelte5-router";
    import type {Trackable} from "@perfice/model/trackable/trackable";

    let viewType: TrackableEditViewType = $state(TrackableEditViewType.GENERAL);
    let editState: EditTrackableState = $state({} as EditTrackableState);
    let modal: Modal;

    let {onStartDelete}: { onStartDelete: (t: Trackable) => void } = $props();

    export function open(state: EditTrackableState) {
        editState = state;
        modal.open();
    }

    async function save() {
        await trackables.updateTrackableFromState($state.snapshot(editState));
    }

    function onDelete() {
        onStartDelete(editState.trackable);
    }

    function switchView(type: string) {
        viewType = type as TrackableEditViewType;
    }

    const SEGMENTS: SegmentedItem<string>[] = [
        {name: "General", value: TrackableEditViewType.GENERAL},
        {name: "Form", suffix: faArrowUpRightFromSquare, onClick: () => goto(`/forms/${editState.trackable.formId}`)},
        {name: "Integration", value: TrackableEditViewType.INTEGRATION}
    ];

    function getViewComponent(e: TrackableEditViewType): Component<{ editState: EditTrackableState }> {
        switch (e) {
            case TrackableEditViewType.GENERAL:
                return EditTrackableGeneral;
            case TrackableEditViewType.INTEGRATION:
                return EditTrackableIntegration;
            default:
                throw new Error("Invalid view!")
        }
    }

    const RendererComponent = $derived(getViewComponent(viewType));
</script>

<Modal type={ModalType.DELETE_CONFIRM_CANCEL} title="Edit trackable" bind:this={modal} {onDelete} onConfirm={save}>
    {#snippet header()}
        <InvertedSegmentedControl value={viewType}
                                  onChange={(t) => switchView(t)}
                                  segments={SEGMENTS}/>
    {/snippet}

    <RendererComponent bind:editState={editState}/>
</Modal>

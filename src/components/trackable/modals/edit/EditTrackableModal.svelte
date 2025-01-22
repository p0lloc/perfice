<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import InvertedSegmentControl from "@perfice/components/base/invertedSegmented/InvertedSegmentControl.svelte";
    import type {Component} from "svelte";
    import {TrackableEditViewType} from "@perfice/model/trackable/ui";
    import EditTrackableGeneral from "@perfice/components/trackable/modals/edit/EditTrackableGeneral.svelte";
    import EditTrackableIntegration from "@perfice/components/trackable/modals/edit/EditTrackableIntegration.svelte";
    import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";
    import type {Trackable} from "@perfice/model/trackable/trackable";

    let viewType: TrackableEditViewType = $state(TrackableEditViewType.GENERAL);
    let modal: Modal;

    export function open(trackable: Trackable) {
        modal.open();
    }

    function getViewComponent(e: TrackableEditViewType): Component {

        switch (e) {
            case TrackableEditViewType.GENERAL:
                return EditTrackableGeneral;
            case TrackableEditViewType.INTEGRATION:
                return EditTrackableIntegration;
            default:
                throw new Error("Invalid view!")
        }
    }

    function save() {
    }

    function onDelete() {
    }

    function switchView(type: string) {
        viewType = type as TrackableEditViewType;
    }

    const SEGMENTS: SegmentedItem<string>[] = [
        {name: "General", value: TrackableEditViewType.GENERAL},
        {name: "Form", suffix: faArrowUpRightFromSquare, onClick: () => console.log("edit form page")},
        {name: "Integration", value: TrackableEditViewType.INTEGRATION}
    ];

    const RendererComponent = $derived(getViewComponent(viewType));
</script>

<Modal type={ModalType.DELETE_CONFIRM_CANCEL} title="Edit trackable" bind:this={modal} {onDelete} onConfirm={save}>
    {#snippet header()}
        <InvertedSegmentControl value={viewType}
                                onChange={(t) => switchView(t)}
                                segments={SEGMENTS}/>
    {/snippet}

    <RendererComponent/>
</Modal>

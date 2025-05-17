<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import InvertedSegmentedControl from "@perfice/components/base/invertedSegmented/InvertedSegmentedControl.svelte";
    import type {Component} from "svelte";
    import {type EditTrackableState, TrackableEditViewType} from "@perfice/model/trackable/ui";
    import EditTrackableGeneral from "@perfice/components/trackable/modals/edit/general/EditTrackableGeneral.svelte";
    import EditTrackableImportExport from "@perfice/components/trackable/modals/edit/EditTrackableImportExport.svelte";
    import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {trackables} from "@perfice/stores";
    import {navigate} from "@perfice/app";

    let viewType: TrackableEditViewType = $state(TrackableEditViewType.GENERAL);
    let editState: EditTrackableState = $state({} as EditTrackableState);
    let modal: Modal;

    let {onStartDelete}: { onStartDelete: (t: Trackable) => void } = $props();

    export function open(state: EditTrackableState) {
        editState = state;
        modal.open();
    }

    function close() {
        modal.close();
    }

    async function save() {
        await trackables.updateTrackableFromState($state.snapshot(editState));
        close();
    }

    function onDelete() {
        onStartDelete(editState.trackable);
        close();
    }

    function switchView(type: string) {
        viewType = type as TrackableEditViewType;
    }

    const SEGMENTS: SegmentedItem<string>[] = [
        {name: "General", value: TrackableEditViewType.GENERAL},
        {
            name: "Form",
            suffix: faArrowUpRightFromSquare,
            onClick: () => navigate(`/forms/${editState.trackable.formId}`)
        },
        // {
        //     name: "Analytics",
        //     suffix: faArrowUpRightFromSquare,
        //     onClick: () => navigate(`/forms/${editState.trackable.formId}`)
        // },
        {name: "Import/Export", value: TrackableEditViewType.IMPORT_EXPORT},
    ];

    function getViewComponent(e: TrackableEditViewType): Component<{
        editState: EditTrackableState,
        close: () => void
    }> {
        switch (e) {
            case TrackableEditViewType.GENERAL:
                return EditTrackableGeneral;
            case TrackableEditViewType.IMPORT_EXPORT:
                return EditTrackableImportExport;
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

    <RendererComponent bind:editState={editState} {close}/>
</Modal>

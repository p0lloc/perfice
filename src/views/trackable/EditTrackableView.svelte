<script lang="ts">
    import type {SegmentedItem} from "@perfice/model/ui/segmented.js";
    import {type EditTrackableState, TrackableEditViewType} from "@perfice/model/trackable/ui";
    import EditTrackableGeneral from "@perfice/components/trackable/edit/general/EditTrackableGeneral.svelte";
    import {onMount} from "svelte";
    import {trackables} from "@perfice/stores";
    import EditTrackableImportExport from "@perfice/components/trackable/edit/EditTrackableImportExport.svelte";
    import EditTrackableGoal from "@perfice/components/trackable/edit/EditTrackableGoal.svelte";
    import {faArrowLeft, faCheck} from "@fortawesome/free-solid-svg-icons";
    import {navigate} from "@perfice/app";
    import InvertedSegmentedControl from "@perfice/components/base/invertedSegmented/InvertedSegmentedControl.svelte";
    import EditTrackableForm from "@perfice/components/trackable/edit/EditTrackableForm.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import EditTrackableAnalytics from "@perfice/components/trackable/edit/general/EditTrackableAnalytics.svelte";
    import EditTrackableIntegrations from "@perfice/components/trackable/edit/EditTrackableIntegrations.svelte";

    let viewType = $state(TrackableEditViewType.GENERAL);
    let editState = $state<EditTrackableState | null>(null);
    let {params}: { params: Record<string, string> } = $props();

    let visitedViews: Set<TrackableEditViewType> = new Set<TrackableEditViewType>([TrackableEditViewType.GENERAL]);
    let viewComponent: any;

    export const ANALYTICS_SEGMENTED_ITEMS: SegmentedItem<TrackableEditViewType>[] = [
        {name: "General", value: TrackableEditViewType.GENERAL},
        {name: "Form", value: TrackableEditViewType.FORM},
        {name: "Goal", value: TrackableEditViewType.GOAL},
        {name: "Analytics", value: TrackableEditViewType.ANALYTICS},
        {name: "Integrations", value: TrackableEditViewType.INTEGRATIONS},
        {name: "Import/export", value: TrackableEditViewType.IMPORT_EXPORT},
    ];

    function getView(v: TrackableEditViewType) {
        switch (v) {
            case TrackableEditViewType.GENERAL:
                return EditTrackableGeneral;
            case TrackableEditViewType.FORM:
                return EditTrackableForm;
            case TrackableEditViewType.GOAL:
                return EditTrackableGoal;
            case TrackableEditViewType.ANALYTICS:
                return EditTrackableAnalytics;
            case TrackableEditViewType.INTEGRATIONS:
                return EditTrackableIntegrations;
            case TrackableEditViewType.IMPORT_EXPORT:
                return EditTrackableImportExport;
        }
    }

    function changeView(v: TrackableEditViewType) {
        visitedViews.add(v);
        viewType = v;
    }

    async function loadTrackable() {
        let trackableId = params.trackableId;
        let trackable = await trackables.getTrackableById(trackableId, true);
        if (trackable == null) return;
        editState = await trackables.getEditTrackableState(trackable);
    }

    async function save() {
        for (let visitedView of visitedViews) {
            await handleViewSave(visitedView);
        }

        back();
    }

    async function handleViewSave(viewType: TrackableEditViewType) {
        switch (viewType) {
            case TrackableEditViewType.GENERAL: {
                if (editState == null) return;
                await trackables.updateTrackable(
                    $state.snapshot(editState.trackable)
                );
                break;
            }
            case TrackableEditViewType.FORM: {
                await viewComponent.save();
                break;
            }
            case TrackableEditViewType.GOAL: {
                await viewComponent.save();
                break;
            }
        }

    }

    function showSave(viewType: TrackableEditViewType) {
        return viewType == TrackableEditViewType.GENERAL || viewType == TrackableEditViewType.FORM;
    }

    function back() {
        navigate("/trackables");
    }

    let RendererComponent = $derived(getView(viewType));

    onMount(() => loadTrackable());
</script>


{#if editState != null}
    <MobileTopBar title={editState.trackable.name}>
        {#snippet leading()}
            <button class="icon-button" onclick={back}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            {#if showSave(viewType)}
                <button class="icon-button" onclick={save}>
                    <Fa icon={faCheck}/>
                </button>
            {/if}
        {/snippet}
    </MobileTopBar>
{/if}
<div class="flex gap-4 items-center w-full xl:w-1/2 md:w-3/4 md:mt-8 md:mx-auto">
    <InvertedSegmentedControl
            class="md:rounded-xl w-full md:text-base text-xs"
            value={viewType}
            onChange={changeView}
            segments={ANALYTICS_SEGMENTED_ITEMS}
    />
    <div class="md:flex gap-2 items-center hidden">
        {#if showSave(viewType)}
            <Button onClick={save}>Save</Button>
        {/if}
        <Button color={ButtonColor.RED} onClick={back}>Close</Button>
    </div>
</div>
<div class="center-view md:mt-2 md:p-0 px-4 py-2 main-content w-full">
    <div class="mt-8">
        {#if editState != null}
            <RendererComponent bind:this={viewComponent} close={back} {editState}/>
        {/if}
    </div>
</div>

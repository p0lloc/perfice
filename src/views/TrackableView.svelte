<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {forms, trackableDate, trackables, weekStart} from "@perfice/main";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import EditTrackableModal from "@perfice/components/trackable/modals/edit/EditTrackableModal.svelte";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import {faBars} from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    let formModal: FormModal;
    let editTrackableModal: EditTrackableModal;

    function onDateChange(e: Date) {
        $trackableDate = e;
    }

    async function onEditTrackable(trackable: Trackable) {
        let state = await trackables.getEditTrackableState($state.snapshot(trackable));
        if (state == null) return;
        editTrackableModal.open(state);
    }


    async function onLogTrackable(trackable: Trackable) {
        let form = await forms.getFormById(trackable.formId);
        if (form == undefined) return;
        formModal.open(form, form.questions, $trackableDate);
    }

    function onDeleteTrackable(trackable: Trackable) {
        trackables.deleteTrackable(trackable);
    }
</script>

<MobileTopBar title="Trackables">
    {#snippet leading()}
        <button class="icon-button" onclick={() => console.log("TODO")}>
            <Fa icon={faBars}/>
        </button>
    {/snippet}
</MobileTopBar>
<FormModal bind:this={formModal}/>
<EditTrackableModal onStartDelete={onDeleteTrackable} bind:this={editTrackableModal}/>

<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar date={$trackableDate} onDateChange={onDateChange} title="Trackables"/>

    <TrackableList date={$trackableDate} weekStart={$weekStart} onEdit={onEditTrackable} onLog={onLogTrackable}/>
</div>

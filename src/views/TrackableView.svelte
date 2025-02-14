<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import {forms, trackableDate, trackables, weekStart} from "@perfice/main";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import EditTrackableModal from "@perfice/components/trackable/modals/edit/EditTrackableModal.svelte";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import type {Trackable} from "@perfice/model/trackable/trackable";

    let formModal: FormModal;
    let editTrackableModal: EditTrackableModal;

    function onDateChange(e: Date) {
        $trackableDate = e;
    }

    async function onEditTrackable(trackable: Trackable) {
        let state = await trackables.getEditTrackableState(trackable);
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

<FormModal bind:this={formModal}/>
<EditTrackableModal onStartDelete={onDeleteTrackable} bind:this={editTrackableModal}/>
<div class="mx-auto w-screen md:w-1/2 md:px-0 px-4 py-10">
    <TitleAndCalendar date={$trackableDate} onDateChange={onDateChange} title="Trackables"/>

    <TrackableList date={$trackableDate} weekStart={$weekStart} onEdit={onEditTrackable} onLog={onLogTrackable}/>
</div>

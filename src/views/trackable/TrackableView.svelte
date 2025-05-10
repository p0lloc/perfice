<script lang="ts">
    import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
    import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
    import EditTrackableModal from "@perfice/components/trackable/modals/edit/EditTrackableModal.svelte";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import {faRuler} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {dateWithCurrentTime} from "@perfice/util/time/simple";
    import {entryImportEvents} from "@perfice/stores/import/formEntry";
    import {subscribeToEventStore} from "@perfice/util/event.js";
    import EntryImportResultModal from "@perfice/components/import/EntryImportResultModal.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import {dateToMidnight} from "@perfice/util/time/simple.js";
    import CreateTrackableModal from "@perfice/components/trackable/modals/create/CreateTrackableModal.svelte";
    import type {TrackableSuggestion} from "@perfice/model/trackable/suggestions";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {forms, trackableCategories, trackableDate, trackables, weekStart} from "@perfice/stores";

    let formModal: FormModal;
    let editTrackableModal: EditTrackableModal;
    let createTrackableModal: CreateTrackableModal;
    let importResultModal: EntryImportResultModal;
    let deleteTrackableModal: GenericDeleteModal<Trackable>;
    let deleteTrackableCategoryModal: GenericDeleteModal<TrackableCategory>;

    function onDateChange(e: Date) {
        $trackableDate = e;
    }

    async function onEditTrackable(trackable: Trackable) {
        let state = await trackables.getEditTrackableState(
            $state.snapshot(trackable),
        );
        if (state == null) return;
        editTrackableModal.open(state);
    }

    async function onLogTrackable(trackable: Trackable) {
        let form = await forms.getFormById(trackable.formId);
        let templates = await forms.getTemplatesByFormId(trackable.formId);
        if (form == undefined) return;

        formModal.open(
            form,
            form.questions,
            form.format,
            dateWithCurrentTime($trackableDate),
            templates,
        );
    }

    function onStartDeleteTrackable(trackable: Trackable) {
        deleteTrackableModal.open(trackable);
    }

    function onStartDeleteTrackableCategory(category: TrackableCategory) {
        deleteTrackableCategoryModal.open(category);
    }

    function onDeleteTrackable(trackable: Trackable) {
        trackables.deleteTrackable(trackable);
    }

    function onDeleteTrackableCategory(category: TrackableCategory) {
        trackableCategories.deleteCategoryById(category.id);
    }

    function onCreateTrackable(categoryId: string | null) {
        createTrackableModal.open(categoryId);
    }

    function onSuggestionSelected(categoryId: string | null, suggestion: TrackableSuggestion) {
        trackables.createTrackableFromSuggestion(suggestion, categoryId);
    }

    function onSingleValue(categoryId: string | null, name: string, icon: string, type: FormQuestionDataType) {
        trackables.createSingleValueTrackable({categoryId: categoryId, name: name, icon: icon, type: type});
    }

    $effect(() =>
        subscribeToEventStore($entryImportEvents, entryImportEvents, (e) =>
            importResultModal.open(e),
        ),
    );

    trackableDate.set(dateToMidnight(new Date()));
    trackables.load();
</script>

<MobileTopBar title="Trackables"/>

<FormModal bind:this={formModal}/>
<EditTrackableModal
        onStartDelete={onStartDeleteTrackable}
        bind:this={editTrackableModal}
/>
<CreateTrackableModal bind:this={createTrackableModal} onSelectSuggestion={onSuggestionSelected}
                      onSingleValue={onSingleValue}/>
<GenericDeleteModal
        subject="this trackable"
        onDelete={onDeleteTrackable}
        bind:this={deleteTrackableModal}
/>

<GenericDeleteModal
        subject="this category and all associated trackables"
        onDelete={onDeleteTrackableCategory}
        bind:this={deleteTrackableCategoryModal}
/>

<EntryImportResultModal bind:this={importResultModal}/>

<div class="w-screen main-content center-view md:px-0 px-4 md:py-10 py-2">
    <TitleAndCalendar
            date={$trackableDate}
            {onDateChange}
            title="Trackables"
            icon={faRuler}
    />

    <TrackableList
            date={$trackableDate}
            weekStart={$weekStart}
            onCreate={onCreateTrackable}
            onCategoryDelete={onStartDeleteTrackableCategory}
            onEdit={onEditTrackable}
            onLog={onLogTrackable}
    />
</div>

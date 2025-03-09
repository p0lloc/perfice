<script lang="ts">
  import TrackableList from "@perfice/components/trackable/TrackableList.svelte";
  import { forms, trackableDate, trackables, weekStart } from "@perfice/main";
  import TitleAndCalendar from "@perfice/components/base/title/TitleAndCalendar.svelte";
  import EditTrackableModal from "@perfice/components/trackable/modals/edit/EditTrackableModal.svelte";
  import FormModal from "@perfice/components/form/modals/FormModal.svelte";
  import type { Trackable } from "@perfice/model/trackable/trackable";
  import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
  import { faBars, faRuler } from "@fortawesome/free-solid-svg-icons";
  // noinspection ES6UnusedImports
  import Fa from "svelte-fa";
  import { dateWithCurrentTime } from "@perfice/util/time/simple";
  import { entryImportEvents } from "@perfice/stores/import/import";
  import { subscribeToEventStore } from "@perfice/util/event.js";
  import EntryImportResultModal from "@perfice/components/import/EntryImportResultModal.svelte";
  import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
  import { onMount } from "svelte";

  let formModal: FormModal;
  let editTrackableModal: EditTrackableModal;
  let importResultModal: EntryImportResultModal;
  let deleteTrackableModal: GenericDeleteModal<Trackable>;

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

  function onDeleteTrackable(trackable: Trackable) {
    trackables.deleteTrackable(trackable);
  }

  $effect(() =>
    subscribeToEventStore($entryImportEvents, entryImportEvents, (e) =>
      importResultModal.open(e),
    ),
  );

  trackables.load();
</script>

<MobileTopBar title="Trackables">
  {#snippet leading()}
    <button class="icon-button" onclick={() => console.log("TODO")}>
      <Fa icon={faBars} />
    </button>
  {/snippet}
</MobileTopBar>

<FormModal bind:this={formModal} />
<EditTrackableModal
  onStartDelete={onStartDeleteTrackable}
  bind:this={editTrackableModal}
/>
<GenericDeleteModal
  subject="this trackable"
  onDelete={onDeleteTrackable}
  bind:this={deleteTrackableModal}
/>
<EntryImportResultModal bind:this={importResultModal} />

<div class="mx-auto w-screen main-content md:w-1/2 md:px-0 px-4 md:py-10 py-2">
  <TitleAndCalendar
    date={$trackableDate}
    {onDateChange}
    title="Trackables"
    icon={faRuler}
  />

  <TrackableList
    date={$trackableDate}
    weekStart={$weekStart}
    onEdit={onEditTrackable}
    onLog={onLogTrackable}
  />
</div>

<script lang="ts">
    import type {EditTrackableState} from "@perfice/model/trackable/ui";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {faDownload} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import FileButton from "@perfice/components/base/fileButton/FileButton.svelte";
    import {entryExports, entryImports} from "@perfice/stores";
    import {downloadTextFile} from "@perfice/util/file";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import {ExportFileType} from "@perfice/services/export/formEntries/export";
    import type {SegmentedItem} from "@perfice/model/ui/segmented";
    import {serializeTrackableToSuggestion} from "@perfice/model/trackable/suggestions";

    let {editState, close}: { editState: EditTrackableState, close: () => void } = $props();
    let fileType = $state(ExportFileType.JSON);

    let dev = import.meta.env.DEV;

    function onFileChange(files: FileList) {
        entryImports.importFile(files[0], editState.trackable.formId);
        close();
    }

    async function onExport() {
        switch (fileType) {
            case ExportFileType.CSV:
                downloadTextFile("import.csv", ExportFileType.CSV,
                    await entryExports.exportCsv(editState.trackable.formId));
                break;
            case ExportFileType.JSON:
                downloadTextFile("import.json", ExportFileType.JSON,
                    await entryExports.exportJson(editState.trackable.formId));
                break;
        }
    }

    function exportSuggestion() {
        console.log(JSON.stringify(serializeTrackableToSuggestion(editState.trackable, editState.form)))
    }

    const FILE_TYPES: SegmentedItem<ExportFileType>[] = [
        {name: "JSON", value: ExportFileType.JSON},
        {name: "CSV", value: ExportFileType.CSV},
    ];
</script>

<h3>Import data</h3>
<FileButton onChange={onFileChange}/>
<h3 class="mt-4">Export data</h3>

<div class="row-gap items-center mt-4 flex-wrap">
    <SegmentedControl class="md:w-auto w-full" value={fileType} onChange={(v) => fileType = v}
                      segments={FILE_TYPES}/>
    <Button class="flex gap-2 items-center w-full md:w-auto justify-center" onClick={onExport}>
        <Fa icon={faDownload}/>
        Export
    </Button>
</div>

{#if dev}
    <Button class="mt-8" onClick={exportSuggestion}>Export suggestion</Button>
{/if}

<style>
    h3 {
        @apply font-bold text-xl text-gray-600;
    }

    span {
        @apply ml-1;
    }
</style>

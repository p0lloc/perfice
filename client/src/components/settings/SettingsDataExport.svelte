<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import {downloadTextFile} from "@perfice/util/file";
    import {ExportFileType} from "@perfice/services/export/formEntries/export";
    import {completeExport} from "@perfice/stores";

    async function onExport() {
        await downloadTextFile("complete-export.json", ExportFileType.JSON,
            JSON.stringify(await completeExport.export()));
    }
</script>

<h3 class="settings-label">Export data</h3>
<div class="row-gap mt-2">
    <Button onClick={onExport}>Export</Button>
</div>

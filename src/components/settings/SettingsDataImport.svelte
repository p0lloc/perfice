<script lang="ts">
    import FileButton from "@perfice/components/base/fileButton/FileButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";
    import {completeImport} from "@perfice/stores";

    let file = $state<File | null>(null);
    let newFormat = $state(true);

    function onFileChange(files: FileList) {
        if (files.length == 0) return;
        file = files[0];
    }

    function onImport() {
        if (file == null) return;
        completeImport.import(file, newFormat);
    }
</script>

<h3 class="settings-label">Import data</h3>
<div class="mt-2">
    <SegmentedControl class="w-64" segments={[
        {
            name: "New format",
            value: true
        },
        {
            name: "Old format",
            value: false
        }
    ]} value={newFormat} onChange={(v) => newFormat = v}/>
</div>

<FileButton class="w-full" displayFile={true} onChange={onFileChange}/>
<Button class="mt-2" onClick={onImport}>Import</Button>

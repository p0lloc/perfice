<script lang="ts">
    import FileButton from "@perfice/components/base/fileButton/FileButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import SegmentedControl from "@perfice/components/base/segmented/SegmentedControl.svelte";

    function onFileChange(files: FileList) {
        console.log(files);
    }

    let newFormat = $state(true);
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
<FileButton displayFile={true} onChange={onFileChange}/>
<Button class="mt-2">Import</Button>

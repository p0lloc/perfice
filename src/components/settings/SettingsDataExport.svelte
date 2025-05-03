<script lang="ts">
    import Button from "@perfice/components/base/button/Button.svelte";
    import MultiSelectDropdownButton from "@perfice/components/base/dropdown/MultiSelectDropdownButton.svelte";
</script>
<h3 class="settings-label">Export data</h3>
<div class="row-gap mt-2">
    <MultiSelectDropdownButton noneText="Everything" value={[]} items={[
        {value: "trackables", name: "Trackables"},
        {value: "tags", name: "Tags"},
        {value: "journal", name: "Journal entries"}
    ]}/>
    <Button>Export</Button>
</div>

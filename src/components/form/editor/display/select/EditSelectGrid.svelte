<script lang="ts">
    import type {SelectGrid} from "@perfice/model/form/display/select";

    let {grid, onChange}: { grid: SelectGrid, onChange: (grid: SelectGrid) => void } = $props();

    function onItemsPerRowChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...grid, itemsPerRow: parseInt(e.currentTarget.value)});
    }

    function onBorderChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...grid, border: e.currentTarget.checked});
    }
</script>

<div class="mt-2 flex flex-col gap-2">
    <div class="row-between">
        <p>Items per row</p>
        <input type="number" class="border w-1/2" value={grid.itemsPerRow} onchange={onItemsPerRowChange}/>
    </div>
    <div class="row-between">
        <p>Border</p>
        <input type="checkbox" class="border" checked={grid.border} onchange={onBorderChange}/>
    </div>
</div>

<script lang="ts">
    import {
        comparePrimitives,
        prettyPrintPrimitive,
        type PrimitiveValue,
        pString
    } from "@perfice/model/primitive/primitive";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {updateIndexInArray} from "@perfice/util/array";

    let {value, onChange}: { value: PrimitiveValue[], onChange: (v: PrimitiveValue[]) => void } = $props();

    function add() {
        onChange([...value, pString("")]);
    }

    function onRemoveValue(v: PrimitiveValue) {
        onChange(value.filter(v2 => !comparePrimitives(v2, v)));
    }

    function onChangeValue(i: number, e: { currentTarget: HTMLInputElement }) {
        onChange(updateIndexInArray($state.snapshot(value), i, pString(e.currentTarget.value)));
    }
</script>
<div class="flex-1 flex flex-col gap-1 min-w-0">
    {#each value as v, i (i)}
        <div class="row-between">
            <input type="text" class="min-w-0" value={prettyPrintPrimitive(v)} onchange={(e) => onChangeValue(i, e)}/>
            <IconButton icon={faTrash} onClick={() => onRemoveValue(v)} class="text-gray-500"/>
        </div>
    {/each}
    <button class="border rounded-xl flex justify-center py-2 hover-feedback min-w-10" onclick={add}>
        <Fa icon={faPlus}/>
    </button>
</div>

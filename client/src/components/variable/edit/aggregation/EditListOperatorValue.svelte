<script lang="ts">
    import {
        comparePrimitives,
        type PrimitiveValue,
        pString
    } from "@perfice/model/primitive/primitive";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {updateIndexInArray} from "@perfice/util/array";
    import FormQuestionValueInput from "@perfice/components/form/valueInput/FormQuestionValueInput.svelte";
    import type {FormQuestion} from "@perfice/model/form/form";

    let {value, onChange, question}: {
        value: PrimitiveValue[],
        onChange: (v: PrimitiveValue[]) => void,
        question: FormQuestion
    } = $props();

    function add() {
        onChange([...value, pString("")]);
    }

    function onRemoveValue(v: PrimitiveValue) {
        onChange(value.filter(v2 => !comparePrimitives(v2, v)));
    }

    function onChangeValue(i: number, e: PrimitiveValue) {
        onChange(updateIndexInArray($state.snapshot(value), i, e));
    }
</script>
<div class="flex-1 flex flex-col gap-1 min-w-0 w-full md:w-auto">
    {#each value as v, i (i)}
        <div class="row-between">
            <FormQuestionValueInput class="flex-1 min-w-0" small={true} {question} value={v}
                                    onChange={(v) => onChangeValue(i, v)}/>
            <IconButton icon={faTrash} onClick={() => onRemoveValue(v)} class="text-gray-500"/>
        </div>
    {/each}
    <button class="border rounded-xl flex justify-center py-2 hover-feedback min-w-10" onclick={add}>
        <Fa icon={faPlus}/>
    </button>
</div>

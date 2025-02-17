<script lang="ts">
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    import type {FormQuestion} from "@perfice/model/form/form";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faHashtag, faPlus, faSquareRootVariable, faTrash} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {updateIndexInArray} from "@perfice/util/array";
    import PopupContextMenuButton from "@perfice/components/base/contextMenu/PopupContextMenuButton.svelte";

    let {representation, availableQuestions, onChange}: {
        representation: TextOrDynamic[],
        availableQuestions: FormQuestion[],
        onChange: (v: TextOrDynamic[]) => void
    } = $props();

    function removeNode(index: number){
        onChange(representation.filter((_, j) => index != j));
    }

    function addNode(dynamic: boolean){
        onChange([...representation, {value: "", dynamic: dynamic}]);
    }

    function onNodeValueChange(index: number, e: { currentTarget: HTMLInputElement }) {
        onChange(updateIndexInArray(representation, index, {value: e.currentTarget.value, dynamic: false}));
    }

    function onDynamicValueChange(index: number, questionId: string){
        onChange(updateIndexInArray(representation, index, {value: questionId, dynamic: true}));
    }

    let questionDropdown = $derived(availableQuestions.map(q => {
        return {
            value: q.id,
            name: q.name
        }
    }));

    const REPRESENTATION_TYPES = [
        {
            name: "Text",
            icon: faHashtag,
            action: () => addNode(false)
        },
        {
            name: "Dynamic value",
            icon: faSquareRootVariable,
            action: () => addNode(true)
        },
    ];
</script>

<div class="max-w-72 md:w-72">
    <div class="flex flex-col gap-2 w-full">
        {#each representation as value, i}
            <div class="flex-1 row-gap">
                {#if value.dynamic}
                    <DropdownButton value={value.value} onChange={(v) => onDynamicValueChange(i, v)} items={questionDropdown} class="flex-1" />
                {:else}
                    <input type="text" value={value.value} class="flex-1" onchange={(e) => onNodeValueChange(i, e)}>
                {/if}
                <IconButton onClick={() => removeNode(i)} icon={faTrash} class="text-gray-500"/>
            </div>
        {/each}
    </div>

    <PopupContextMenuButton items={REPRESENTATION_TYPES} class="rounded-xl w-full mt-4 flex justify-center items-center">
        <Fa icon={faPlus}/>
    </PopupContextMenuButton>
</div>

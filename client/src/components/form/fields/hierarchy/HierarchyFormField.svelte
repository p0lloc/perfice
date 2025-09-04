<script lang="ts">
    import type {FormFieldProps} from "@perfice/model/form/ui";
    import HierarchyButton from "@perfice/components/form/fields/hierarchy/HierarchyButton.svelte";
    import type {HierarchyFormQuestionDataSettings, HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import {comparePrimitives, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

    let {dataSettings, disabled, value, onChange}: FormFieldProps = $props();

    let data = $derived(dataSettings as HierarchyFormQuestionDataSettings);

    let [root, selected] = $derived(findRootAndSelected(value));

    function findRootAndSelected(value: PrimitiveValue[]): [HierarchyOption, HierarchyOption | null] {
        let newRoot = data.root;
        let selectedOption: HierarchyOption | null = null;
        for (let primitive of value) {
            let child = newRoot.children.find(o => comparePrimitives(o.value, primitive));
            if (child == null) continue;

            selectedOption = child;

            if (child.children.length > 0) {
                newRoot = child;
            }
        }

        return [newRoot, selectedOption];
    }

    function reset() {
        onChange([]);
    }

    function onOptionClicked(o: HierarchyOption) {
        if (disabled) return;
        let currentValue: PrimitiveValue[] = $state.snapshot(value);
        if (selected?.children.length == 0) {
            // If current value has no children, remove it as the selected option
            currentValue = currentValue.filter(v => !comparePrimitives(v, selected!.value));
        }

        let newValue = [...currentValue, $state.snapshot(o).value]
        onChange(newValue);
    }
</script>

<div class="md:max-w-[28rem]">
    {#if selected != null && (value.length > 1 || selected.children.length > 0)}
        <div class="mb-2">
            <IconButton icon={faArrowLeft} onClick={reset}/>
        </div>
    {/if}
    <div class="grid gap-4"
         style:grid-template-columns="repeat({root.gridSize ?? 2}, minmax(0, 1fr))">
        {#each root.children as option(option.id)}
            <HierarchyButton selected={selected?.id === option.id} {option}
                             onClick={() => onOptionClicked(option)}/>
        {/each}
    </div>

</div>

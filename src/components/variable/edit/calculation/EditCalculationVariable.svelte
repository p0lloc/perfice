<script lang="ts">
    import {type Variable, VariableTypeName} from "@perfice/model/variable/variable";
    import {
        type CalculationEntry,
        CalculationOperator,
        CalculationVariableType
    } from "@perfice/services/variable/types/calculation";
    import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";
    import Button from "@perfice/components/base/button/Button.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {ButtonColor} from "@perfice/model/ui/button";
    import {pNull, pNumber, PrimitiveValueType, pString} from "@perfice/model/primitive/primitive";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import AddSourceButton from "@perfice/components/goal/editor/condition/comparison/AddSourceButton.svelte";
    import {CALCULATION_OPERATORS} from "@perfice/model/variable/ui";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import type {ConstantOrVariable} from "@perfice/services/variable/types/goal";
    import {updateIndexInArray} from "@perfice/util/array";
    import type {EditConstantOrVariableState} from "@perfice/model/goal/ui";
    import {variableEditProvider} from "@perfice/stores";

    let {
        variable, value,
        onEdit,
    }: {
        variable: Variable,
        value: CalculationVariableType,
        editState: any,
        onEdit: (v: EditConstantOrVariableState) => void
    } = $props();

    let entries = $state(value.getEntries());

    function addEntry() {
        if (entries.length == 0) {
            // First calculation must be between two values
            entries.push({constant: true, value: pNull()});
        }

        entries.push(...[
            CalculationOperator.PLUS,
            {constant: true, value: pNull()}
        ]);

        updateVariable();
    }

    function removeEntryGroup(index: number) {
        let indicesToRemove: number[] = [];
        if (index == 1) {
            // If this is first operator, remove the first entry too
            indicesToRemove.push(0);
        }

        // Remove the entry and the next one
        indicesToRemove.push(...[index, index + 1]);
        entries = entries.filter((_, i) => !indicesToRemove.includes(i));

        updateVariable();
    }

    function onAddSource(constant: boolean, index: number) {
        if (constant) {
            let value = {constant: true, value: pNumber(0.0)};
            updateAndEditSource(index, value);
        } else {
            let variable = variableEditProvider.createVariableFromType(VariableTypeName.AGGREGATE);
            let value = {constant: false, value: pString(variable.id)};
            updateAndEditSource(index, value);
            /*onSidebar({
                type: GoalSidebarActionType.ADD_SOURCE, value: {
                    onSourceSelected: (type: VariableTypeName) => {
                        let variable = variableEditProvider.createVariableFromType(type);
                        let value = {constant: false, value: pString(variable.id)};
                        updateSourceOrTarget(value, source);
                    }
                }
            });*/
        }
    }

    function updateAndEditSource(index: number, value: ConstantOrVariable) {
        entries = updateIndexInArray(entries, index, value);
        updateEntryAtIndex(index, value);
        editEntry(index);
    }

    function editEntry(index: number) {
        let atIndex = entries[index];
        if (typeof atIndex != "object") return;

        onEdit({
            value: $state.snapshot(atIndex), onChange: (v: ConstantOrVariable) => {
                updateEntryAtIndex(index, v);
            }
        });
    }

    function updateEntryAtIndex(index: number, value: CalculationEntry) {
        entries = updateIndexInArray(entries, index, value);
        updateVariable();
    }

    function updateVariable() {
        variableEditProvider.updateVariable({
            ...variable, type: {
                type: VariableTypeName.CALCULATION,
                value: new CalculationVariableType($state.snapshot(entries))
            }
        })
    }

    function onChangeOperator(index: number, operator: CalculationOperator) {
        updateEntryAtIndex(index, operator);
    }

    function removeEntry(index: number) {
        updateEntryAtIndex(index, {constant: true, value: pNull()});
    }
</script>

<div class="flex flex-col gap-2 mb-4">
    {#each entries as entry, index}
        {#if typeof entry == "object"}
            {#if entry.value.type !== PrimitiveValueType.NULL }
                <GenericEditDeleteCard text={variableEditProvider.textForConstantOrVariable(entry)}
                                       onEdit={() => editEntry(index)}
                                       onDelete={() => removeEntry(index)}/>
            {:else}
                <AddSourceButton onAdd={(constant) => onAddSource(constant, index)}/>
            {/if}
        {:else}
            <div class="row-gap">
                <DropdownButton class="flex-1" items={CALCULATION_OPERATORS} value={entry}
                                onChange={(v) => onChangeOperator(index, v)}/>
                <IconButton icon={faTrash} class="text-gray-500" onClick={() => removeEntryGroup(index)}/>
            </div>
        {/if}
    {/each}
    <Button class="flex justify-center items-center" color={ButtonColor.WHITE} onClick={addEntry}>
        <Fa icon={faPlus}/>
    </Button>
</div>

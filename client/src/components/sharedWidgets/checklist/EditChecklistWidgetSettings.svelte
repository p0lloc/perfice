<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import EditChecklistConditionCard
        from "@perfice/components/sharedWidgets/checklist/EditChecklistConditionCard.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import EditChecklistConditionModal
        from "@perfice/components/sharedWidgets/checklist/EditChecklistConditionModal.svelte";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import type {ChecklistCondition, ChecklistWidgetSettings} from "@perfice/model/sharedWidgets/checklist/checklist";
    import {SIMPLE_TIME_SCOPE_TYPES} from "@perfice/model/variable/ui";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {tags} from "@perfice/stores";

    let {settings, onChange, forms}: {
        settings: ChecklistWidgetSettings,
        onChange: (settings: ChecklistWidgetSettings) => void,
        forms: Form[],
    } = $props();

    let dragContainer: DragAndDropContainer;
    let editModal: EditChecklistConditionModal;

    async function addOrEditOption(condition: ChecklistCondition | null) {
        let availableTags = await $tags;
        let modified = await editModal.open(condition, forms, availableTags);
        if (modified == null) return;

        onChange({
            ...settings,
            conditions: condition != null
                ? updateIdentifiedInArray(settings.conditions, modified) // Update existing
                : [...settings.conditions, modified] // Add new
        });
        dragContainer.invalidateItems();
    }

    async function addOption() {
        await addOrEditOption(null);
    }

    async function onEditOption(condition: ChecklistCondition) {
        await addOrEditOption(structuredClone($state.snapshot(condition)));
    }

    function onDeleteOption(condition: ChecklistCondition) {
        onChange({...settings, conditions: deleteIdentifiedInArray(settings.conditions, condition.id)});
        dragContainer.invalidateItems();
    }

    function onTimeScopeChange(v: SimpleTimeScopeType) {
        onChange({...settings, timeScope: v});
    }

    function onReorderFinalize(items: ChecklistCondition[]) {
        onChange({...settings, conditions: items});
    }
</script>

<EditChecklistConditionModal bind:this={editModal}/>
<div class="row-between mt-2">
    <span class="text-gray-500 font-bold">Time scope</span>
    <BindableDropdownButton value={settings.timeScope} items={SIMPLE_TIME_SCOPE_TYPES}
                            onChange={onTimeScopeChange}/>
</div>
<div class="row-gap mt-2">
    <h2 class="text-xl text-gray-500 font-bold">Items</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>

<DragAndDropContainer zoneId="select-options" bind:this={dragContainer} onFinalize={onReorderFinalize}
                      items={settings.conditions}
                      class="flex flex-col gap-2 mt-2">
    {#snippet item(condition)}
        <EditChecklistConditionCard {condition} onEdit={() => onEditOption(condition)}
                                    onDelete={() => onDeleteOption(condition)}/>
    {/snippet}
</DragAndDropContainer>

<script lang="ts">
    import type {
        ReflectionChecklistWidgetAnswerState,
        ReflectionChecklistWidgetSettings
    } from "@perfice/model/reflection/widgets/checklist";
    import ChecklistWidget from "@perfice/components/sharedWidgets/checklist/ChecklistWidget.svelte";
    import type {ChecklistData} from "@perfice/stores/sharedWidgets/checklist/checklist";
    import {updateIdentifiedInArray} from "@perfice/util/array";

    let {settings, state: checklistState, onChange, dependencies}: {
        settings: ReflectionChecklistWidgetSettings,
        state: ReflectionChecklistWidgetAnswerState,
        dependencies: Record<string, string>,
        onChange: (state: ReflectionChecklistWidgetAnswerState) => void
    } = $props();

    export function validate(): boolean {
        return true;
    }

    async function updateOrAddData(data: ChecklistData) {
        let existing = checklistState.data.find(v => v.id == data.id);
        if(existing != null){
            onChange({
                ...checklistState,
                data: updateIdentifiedInArray(checklistState.data, data)
            })
        } else {
            onChange({
                ...checklistState,
                data: [...checklistState.data, data]
            })
        }
    }

</script>

<ChecklistWidget date={new Date()} {settings} {dependencies}
                 extraData={$state.snapshot(checklistState.data)} onUncheck={updateOrAddData}
                 onCheck={updateOrAddData}/>
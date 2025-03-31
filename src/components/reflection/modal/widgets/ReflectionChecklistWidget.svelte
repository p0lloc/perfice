<script lang="ts">
    import type {
        ReflectionChecklistWidgetAnswerState,
        ReflectionChecklistWidgetSettings
    } from "@perfice/model/reflection/widgets/checklist";
    import ChecklistWidget from "@perfice/components/sharedWidgets/checklist/ChecklistWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {ChecklistData} from "@perfice/stores/sharedWidgets/checklist/checklist";
    import type {ChecklistConditionType} from "@perfice/model/sharedWidgets/checklist/checklist";

    let {settings, state: checklistState, onChange, dependencies}: {
        settings: ReflectionChecklistWidgetSettings,
        state: ReflectionChecklistWidgetAnswerState,
        dependencies: Record<string, string>,
        onChange: (state: ReflectionChecklistWidgetAnswerState) => void
    } = $props();

    export function validate(): boolean {
        return true;
    }

    async function onCheck(data: ChecklistData) {
        onChange({
            ...checklistState,
            data: [...checklistState.data, data]
        });
    }

    async function onUncheck(type: ChecklistConditionType, entryId: string) {
        onChange({
            ...checklistState,
            data: checklistState.data.filter(v => v.type != type || v.data.entryId != entryId)
        })
    }

</script>

<ChecklistWidget date={new Date()} {settings} {dependencies}
                 extraData={$state.snapshot(checklistState.data)} {onCheck}
                 {onUncheck}/>
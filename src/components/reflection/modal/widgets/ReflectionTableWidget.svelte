<script lang="ts">
    import TableWidget from "@perfice/components/sharedWidgets/table/TableWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {
        ReflectionTableWidgetAnswerState,
        ReflectionTableWidgetSettings
    } from "@perfice/model/reflection/widgets/table";

    let {settings, state: tableState, onChange, dependencies, openNestedForm}: {
        settings: ReflectionTableWidgetSettings,
        state: ReflectionTableWidgetAnswerState,
        dependencies: Record<string, string>,
        onChange: (state: ReflectionTableWidgetAnswerState) => void,
        openNestedForm: (formId: string,
                         onLog: (answers: Record<string, PrimitiveValue>) => void,
                         answers?: Record<string, PrimitiveValue>) => void
    } = $props();

    export function validate(): boolean {
        return true;
    }

    async function openFormModal(formId: string, formAnswers?: Record<string, PrimitiveValue>) {
        openNestedForm(formId, onFormLog, formAnswers);
    }

    function onFormLog(answers: Record<string, PrimitiveValue>) {
        onChange({
            ...tableState,
            answers: [...tableState.answers, answers]
        })
    }
</script>


<TableWidget {settings} date={new Date()} {openFormModal}
             listVariableId={dependencies["list"]}
             extraAnswers={tableState.answers}/>
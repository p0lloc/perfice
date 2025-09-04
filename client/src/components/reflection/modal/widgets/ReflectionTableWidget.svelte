<script lang="ts">
    import TableWidget from "@perfice/components/sharedWidgets/table/TableWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {
        ReflectionTableWidgetAnswerState,
        ReflectionTableWidgetSettings
    } from "@perfice/model/reflection/widgets/table";
    import type {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {formatTimestampForTable} from "@perfice/stores/sharedWidgets/table/table";
    import {weekStart} from "@perfice/stores";

    let {settings, state: tableState, onChange, dependencies, openNestedForm}: {
        settings: ReflectionTableWidgetSettings,
        state: ReflectionTableWidgetAnswerState,
        dependencies: Record<string, string>,
        onChange: (state: ReflectionTableWidgetAnswerState) => void,
        openNestedForm: (formId: string,
                         onLog: (answers: Record<string, PrimitiveValue>, timestamp: number) => void,
                         timeScope: SimpleTimeScopeType,
                         answers?: Record<string, PrimitiveValue>) => void
    } = $props();

    export function validate(): boolean {
        return true;
    }

    async function openFormModal(formId: string, formAnswers?: Record<string, PrimitiveValue>) {
        openNestedForm(formId, onFormLog, settings.timeScope, formAnswers);
    }

    function onFormLog(answers: Record<string, PrimitiveValue>, timestamp: number) {
        onChange({
            ...tableState,
            answers: [...tableState.answers, {
                ...answers,
                timestamp:
                    formatTimestampForTable(timestamp, new Date(), $weekStart)
            }]
        })
    }
</script>

<TableWidget {settings} date={new Date()} {openFormModal}
             listVariableId={dependencies["list"]}
             extraAnswers={tableState.answers}/>
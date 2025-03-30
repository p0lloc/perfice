<script lang="ts">
    import type {
        ReflectionTableWidgetAnswerState,
        ReflectionTagsWidgetAnswerState
    } from "@perfice/model/reflection/reflection";
    import TableWidget from "@perfice/components/table/TableWidget.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {ReflectionTableWidgetSettings} from "@perfice/model/reflection/widgets/table";

    let {settings, state, onChange, dependencies}: {
        settings: ReflectionTableWidgetSettings,
        state: ReflectionTableWidgetAnswerState,
        dependencies: Record<string, string>,
        onChange: (state: ReflectionTagsWidgetAnswerState) => void
    } = $props();


    export function validate(): boolean {
        return true;
    }

    function openFormModal(formId: string, answers?: Record<string, PrimitiveValue>) {
        // TODO: open inline form embed instead
        console.log(formId, answers);
    }
</script>

<TableWidget {settings} date={new Date()} {openFormModal} listVariableId={dependencies["list"]}/>

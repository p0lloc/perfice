<script lang="ts">
    import type {
        ReflectionChecklistWidgetAnswerState,
        ReflectionChecklistWidgetSettings
    } from "@perfice/model/reflection/widgets/checklist";

    let {settings, state, onChange}: {
        settings: ReflectionChecklistWidgetSettings,
        state: ReflectionChecklistWidgetAnswerState,
        onChange: (state: ReflectionChecklistWidgetAnswerState) => void
    } = $props();

    export function validate(): boolean {
        return true;
    }
</script>

checklist
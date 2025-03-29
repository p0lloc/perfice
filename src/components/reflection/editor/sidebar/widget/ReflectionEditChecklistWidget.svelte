<script lang="ts">

    import type {ReflectionChecklistWidgetSettings} from "@perfice/model/reflection/widgets/checklist";

    let {settings, onChange}: {
        settings: ReflectionChecklistWidgetSettings,
        onChange: (settings: ReflectionChecklistWidgetSettings) => void
    } = $props();
</script>

form
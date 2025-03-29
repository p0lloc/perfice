<script lang="ts">
    import type {ReflectionTableWidgetSettings} from "@perfice/model/reflection/reflection";

    let {settings, onChange}: {
        settings: ReflectionTableWidgetSettings,
        onChange: (settings: ReflectionTableWidgetSettings) => void
    } = $props();
</script>

form
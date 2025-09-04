<script lang="ts">

    import type {ReflectionChecklistWidgetSettings} from "@perfice/model/reflection/widgets/checklist";
    import EditChecklistWidgetSettings
        from "@perfice/components/sharedWidgets/checklist/EditChecklistWidgetSettings.svelte";
    import type {Form} from "@perfice/model/form/form";

    let {settings, onChange, forms}: {
        settings: ReflectionChecklistWidgetSettings,
        forms: Form[],
        onChange: (settings: ReflectionChecklistWidgetSettings) => void
    } = $props();
</script>

<EditChecklistWidgetSettings {forms} {settings} {onChange}/>
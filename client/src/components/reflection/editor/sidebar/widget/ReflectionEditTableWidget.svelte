<script lang="ts">

    import type {ReflectionTableWidgetSettings} from "@perfice/model/reflection/widgets/table";
    import EditTableWidgetSettings from "@perfice/components/sharedWidgets/table/EditTableWidgetSettings.svelte";
    import type {Form} from "@perfice/model/form/form";

    let {settings, onChange, forms}: {
        settings: ReflectionTableWidgetSettings,
        onChange: (settings: ReflectionTableWidgetSettings) => void,
        forms: Form[],
    } = $props();
</script>

<EditTableWidgetSettings {settings} {onChange} {forms}/>

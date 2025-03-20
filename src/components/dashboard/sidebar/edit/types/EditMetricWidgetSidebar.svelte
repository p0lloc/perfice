<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import type {Form} from "@perfice/model/form/form";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";

    let {settings, onChange, forms}: {
        settings: DashboardMetricWidgetSettings,
        onChange: (settings: DashboardMetricWidgetSettings) => void,
        forms: Form[]
    } = $props();
</script>

<div class="row-between">
    Icon
    <IconPickerButton right={true} icon={settings.icon} onChange={(icon) => onChange({...settings, icon})}/>
</div>

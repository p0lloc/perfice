<script lang="ts">
    import type {Form} from "@perfice/model/form/form";
    import type {DashboardEntryRowWidgetSettings} from "@perfice/model/dashboard/widgets/entryRow";
    import SelectFormAndQuestion from "@perfice/components/dashboard/sidebar/edit/SelectFormAndQuestion.svelte";

    let {settings, onChange, forms}: {
        settings: DashboardEntryRowWidgetSettings,
        onChange: (settings: DashboardEntryRowWidgetSettings) => void,
        forms: Form[]
    } = $props();
</script>

<SelectFormAndQuestion onChange={onChange} settings={settings} forms={forms}/>

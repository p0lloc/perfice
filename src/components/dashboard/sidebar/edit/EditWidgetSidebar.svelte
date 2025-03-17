<script lang="ts">
    import type {DashboardEditWidgetAction} from "@perfice/model/dashboard/ui";

    let {action}: { action: DashboardEditWidgetAction } = $props();
</script>

<input type="text" onchange={(e) =>
action.onChange({...action.widget, settings: {...action.widget.settings, formId: e.currentTarget.value}})}/>
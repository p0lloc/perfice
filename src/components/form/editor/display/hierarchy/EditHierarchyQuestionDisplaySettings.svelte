<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {HierarchyFormDisplaySettings} from "@perfice/model/form/display/hierarchy";

    let {settings = $bindable(), dataType, dataSettings}: {
        settings: HierarchyFormDisplaySettings,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();
</script>

<div class="row-between">
    Show only last option
    <input type="checkbox" bind:checked={settings.onlyLeafOption}/>
</div>

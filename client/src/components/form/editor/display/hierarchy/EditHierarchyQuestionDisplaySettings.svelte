<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {HierarchyFormDisplaySettings} from "@perfice/model/form/display/hierarchy";

    let {settings, onChange}: {
        settings: HierarchyFormDisplaySettings,
        onChange: (settings: HierarchyFormDisplaySettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    function onOnlyLeafOptionChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, onlyLeafOption: e.currentTarget.checked});
    }
</script>

<div class="row-between">
    Show only last option
    <input type="checkbox" checked={settings.onlyLeafOption} onchange={onOnlyLeafOptionChange}/>
</div>

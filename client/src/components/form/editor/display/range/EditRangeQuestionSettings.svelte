<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";

    let {settings, onChange, dataType, dataSettings}: {
        settings: RangeFormQuestionSettings,
        onChange: (settings: RangeFormQuestionSettings) => void,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();

    function onStepChange(e: { currentTarget: HTMLInputElement }) {
        onChange({...settings, step: parseInt(e.currentTarget.value)});
    }
</script>

<div class="row-between">
    Step
    <input type="number" class="border" value={settings.step} onchange={onStepChange} min="1"/>
</div>

<script lang="ts">
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import type {RangeFormQuestionSettings} from "@perfice/model/form/display/range";

    let {settings = $bindable(), dataType, dataSettings}: {
        settings: RangeFormQuestionSettings,
        dataType: FormQuestionDataType,
        dataSettings: any
    } = $props();
</script>

<div class="row-between">
    Step
    <input type="number" class="border" bind:value={settings.step} min="1"/>
</div>

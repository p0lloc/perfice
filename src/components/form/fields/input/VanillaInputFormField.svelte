<script lang="ts">
    import {getHtmlInputFromQuestionType, type InputFieldProps} from "@perfice/model/form/ui";

    let {dataType, disabled, value, onChange}: InputFieldProps = $props();

    function onInputChange(e: { currentTarget: HTMLInputElement }) {
        onChange(e.currentTarget.value);
    }
</script>

<input class="border bg-white" {disabled} value={value} onchange={onInputChange}
       type={getHtmlInputFromQuestionType(dataType)}/>

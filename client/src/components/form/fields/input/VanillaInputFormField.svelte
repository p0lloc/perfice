<script lang="ts">
    import {
        getHtmlInputFromQuestionType,
        type InputFieldProps,
    } from "@perfice/model/form/ui";

    let { dataType, disabled, value, onChange }: InputFieldProps = $props();

    let input: HTMLInputElement;

    export function focus() {
        input.focus();
    }

    function onInputChange(e: { currentTarget: HTMLInputElement }) {
        onChange(e.currentTarget.value);
    }
</script>

<input
    class="border bg-white dark:bg-gray-900 dark-border"
    {disabled}
    {value}
    onchange={onInputChange}
    bind:this={input}
    type={getHtmlInputFromQuestionType(dataType)}
/>

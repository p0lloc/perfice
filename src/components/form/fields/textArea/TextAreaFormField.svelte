<script lang="ts">
    import {type FormFieldProps} from "@perfice/model/form/ui";

    let {disabled, value, onChange}: FormFieldProps = $props();

    let input: HTMLTextAreaElement;

    export function focus() {
        input.focus();
    }

    function onInputChange(e: { currentTarget: HTMLTextAreaElement }) {
        onChange(e.currentTarget.value);
    }
</script>

<textarea spellcheck="false" class="border bg-white md:w-1/2 w-full" {disabled} value={value} onchange={onInputChange}
          rows="3"
          bind:this={input}
></textarea>

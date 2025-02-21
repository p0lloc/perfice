<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import FormFieldRenderer from "@perfice/components/form/fields/FormFieldRenderer.svelte";
    import type {FormQuestion} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import {getDefaultPrimitiveValue} from "@perfice/model/primitive/primitive";

    let {question, selected, onClick, onDelete}: {
        question: FormQuestion,
        selected: boolean,
        onClick: () => void,
        onDelete: () => void
    } = $props();

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClick();
    }

    let defaultValue = $derived(questionDataTypeRegistry.getDefaultValue(question.dataType)!);
</script>

<div role="button" tabindex="0" onkeydown={onKeyDown}
     class="block text-left border-dashed w-full transparent-border relative" class:selected={selected}
     onclick={onClick}>
    {#if selected}
        <button class="absolute right-0 top-0 pointer-feedback:text-red-600" onclick={onDelete}>
            <Fa icon={faTrash}/>
        </button>
    {/if}
    <p class="text-xl font-bold mb-2">{question.name}</p>
    <FormFieldRenderer dataSettings={question} value={defaultValue} disabled={true}
                       onChange={() => {}}
                       displayType={question.displayType}
                       displaySettings={question}/>
</div>

<style>
    .transparent-border {
        border: 2px dashed white;
    }

    .selected {
        border: 2px dashed #dcdcdc;
    }
</style>

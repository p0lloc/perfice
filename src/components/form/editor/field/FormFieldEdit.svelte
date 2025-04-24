<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTrash} from "@fortawesome/free-solid-svg-icons";
    import FormFieldRenderer from "@perfice/components/form/fields/FormFieldRenderer.svelte";
    import type {FormQuestion} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";

    let {
        question,
        selected,
        onClick,
        onDelete,
    }: {
        question: FormQuestion;
        selected: boolean;
        onClick: () => void;
        onDelete: () => void;
    } = $props();

    function onKeyDown(e: KeyboardEvent) {
        if (e.key != "Enter") return;

        onClick();
    }

    let defaultValue = $derived(
        questionDataTypeRegistry.getDefaultValue(question.dataType)!,
    );

    function onDeleteClick(e: MouseEvent) {
        // Prevent the click from bubbling to the parent so it would open the sidebar again
        e.stopPropagation();
        onDelete();
    }

    let emptyName = $derived(question.name == "");
</script>

<div
        role="button"
        tabindex="0"
        onkeydown={onKeyDown}
        class="block text-left w-full transparent-border relative"
        class:selected
        onclick={onClick}
>
    <button
            class="absolute right-0 top-0 pointer-feedback:text-red-600 text-gray-500"
            class:md:invisible={!selected}
            onclick={onDeleteClick}
    >
        <Fa icon={faTrash}/>
    </button>
    <p class="text-xl font-bold mb-2" class:text-gray-400={emptyName}>
        {!emptyName ? question.name : "<Empty name>"}
    </p>
    <FormFieldRenderer
            dataSettings={question}
            value={defaultValue}
            disabled={true}
            onChange={() => {}}
            unit={question.unit ?? undefined}
            displayType={question.displayType}
            displaySettings={question}
    />
</div>

<style>
    .transparent-border {
        border: 2px dashed transparent;
    }

    .selected {
        border: 2px dashed #dcdcdc;
    }
</style>

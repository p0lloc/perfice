<script lang="ts" generics="T extends Identified<string>">
    import {faPlus, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    // noinspection ES6UnusedImports
    import type {Identified} from "@perfice/util/array";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";

    type OptionCallback = (value: T | null) => void;

    let {
        options,
        onChange,
        onAdd,
        onEdit,
        text,
        icon
    }: {
        options: T[],
        onChange: (options: T[]) => void,
        onAdd?: () => void,
        onEdit?: (option: T) => Promise<T | null>,
        text: (option: T) => string,
        icon?: (option: T) => IconDefinition,
    } = $props();

    async function addOption() {
        if (onAdd == null) return;

        onAdd();
    }

    async function onEditOption(option: T) {
        if (onEdit == null) return;

        let updatedOption = await onEdit(option);
        if (updatedOption == null) return;

        onChange(updateIdentifiedInArray(options, updatedOption));
    }

    function onDeleteOption(option: T) {
        onChange(deleteIdentifiedInArray(options, option.id));
    }

    function onReorderFinalize(options: T[]) {
        onChange(options);
    }
</script>

<div class="row-gap">
    <h2 class="text-xl text-gray-500 dark:text-white font-bold">Labels</h2>
    <IconButton icon={faPlus} onClick={addOption}/>
</div>

<div>
    <DragAndDropContainer
            dragHandles={true}
            zoneId="text-or-dynamic"
            items={options}
            onFinalize={onReorderFinalize}
            class="flex flex-col gap-2 w-full"
    >
        {#snippet item(option, i)}
            <GenericEditDeleteCard onEdit={() => onEditOption(option)}
                                   onDelete={() => onDeleteOption(option)}
                                   dragHandle={true}
                                   icon={icon != null ? icon(option) : undefined}
                                   text={text(option)}/>
        {/snippet}
    </DragAndDropContainer>
</div>

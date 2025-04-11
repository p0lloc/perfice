<script lang="ts">
    import TagButtonBase from "@perfice/components/tag/TagButtonBase.svelte";
    import {faPen, faPlus} from "@fortawesome/free-solid-svg-icons";
    import type {Tag} from "@perfice/model/tag/tag";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {tag, checked, onClick, editing = false}: {
        tag: Tag,
        checked: boolean,
        onClick: () => void,
        editing?: boolean
    } = $props();

    function getIcon(checked: boolean, editing: boolean) {
        if (editing) {
            return faPen;
        }

        return checked ? faPlus : faPlus;
    }
</script>
<TagButtonBase {checked} {onClick}>
    <span class="text-ellipsis overflow-hidden">{tag.name}</span>
    <span class="w-2">
            <Fa icon={getIcon(checked, editing)}/>
    </span>
</TagButtonBase>

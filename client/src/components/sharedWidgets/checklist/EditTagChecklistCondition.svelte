<script lang="ts">
    import type {Tag} from "@perfice/model/tag/tag";
    import {faTags} from "@fortawesome/free-solid-svg-icons";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {ChecklistTagCondition} from "@perfice/model/sharedWidgets/checklist/checklist";

    let {tags, value, onChange}: {
        tags: Tag[],
        value: ChecklistTagCondition,
        onChange: (v: ChecklistTagCondition) => void
    } = $props();

    function onTagChanged(tagId: string) {
        onChange({...value, tagId});
    }

    const tagDropdownItems = $derived(tags.map(v => {
        return {
            value: v.id,
            name: v.name,
        }
    }));
</script>

<div class="row-between">
    <IconLabel icon={faTags} title="Tag"/>
    <DropdownButton value={value.tagId} items={tagDropdownItems} onChange={onTagChanged}/>
</div>

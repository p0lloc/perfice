<script lang="ts">
    import {faBoxesStacked} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import type {TrackableCategory} from "@perfice/model/trackable/trackable";
    import {UNCATEGORIZED_NAME} from "@perfice/util/category";

    let {categories, categoryId, onChange}: {
        categories: TrackableCategory[],
        categoryId: string | null,
        onChange: (id: string | null) => void
    } = $props();

    let dropdownItems = $derived([{id: null, name: UNCATEGORIZED_NAME}, ...categories].map(c => {
        return {
            name: c.name,
            value: c.id,
            action: () => onChange(c.id)
        }
    }));
</script>

<IconLabelBetween title="Category" icon={faBoxesStacked}>
    <DropdownButton value={categoryId} items={dropdownItems}/>
</IconLabelBetween>

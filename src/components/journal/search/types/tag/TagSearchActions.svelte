<script lang="ts">
    import {
        createTagSearchFilter,
        TAG_SEARCH_FILTER_TYPES,
        type TagSearch,
        type TagSearchFilter,
        TagSearchFilterType
    } from "@perfice/model/journal/search/tag";
    import {faFilter} from "@fortawesome/free-solid-svg-icons";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";

    let {options, onChange}: { options: TagSearch, onChange: (search: TagSearch) => void } = $props();

    function onAddFilter(v: TagSearchFilterType) {
        onChange({
            ...options,
            filters: [...options.filters, createTagSearchFilter(v)]
        });
    }

    let buttons = TAG_SEARCH_FILTER_TYPES.map((t) => {
        return {
            name: t.name,
            icon: t.icon,
            action: () => onAddFilter(t.value),
        };
    });
</script>

<PopupIconButton icon={faFilter} buttons={buttons}/>

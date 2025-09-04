<script lang="ts">
    import {
        createTrackableSearchFilter,
        TRACKABLE_SEARCH_FILTER_TYPES,
        type TrackableSearch,
        type TrackableSearchFilter,
        TrackableSearchFilterType
    } from "@perfice/model/journal/search/trackable";
    import {faFilter} from "@fortawesome/free-solid-svg-icons";
    import PopupIconButton from "@perfice/components/base/button/PopupIconButton.svelte";

    let {options, onChange}: { options: TrackableSearch, onChange: (search: TrackableSearch) => void } = $props();

    function onAddFilter(v: TrackableSearchFilterType) {
        onChange({
            ...options,
            filters: [...options.filters, createTrackableSearchFilter(v)]
        });
    }

    let buttons = TRACKABLE_SEARCH_FILTER_TYPES.map((t) => {
        return {
            name: t.name,
            icon: t.icon,
            action: () => onAddFilter(t.value),
        };
    });
</script>

<PopupIconButton icon={faFilter} buttons={buttons}/>

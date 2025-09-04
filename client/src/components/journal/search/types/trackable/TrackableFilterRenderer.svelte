<script lang="ts">
    import {
        type TrackableSearchFilter,
        TrackableSearchFilterType,
    } from "@perfice/model/journal/search/trackable";
    import type { Component } from "svelte";
    import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";
    import TrackableOneOfFilterCard from "@perfice/components/journal/search/types/trackable/filters/TrackableOneOfFilterCard.svelte";
    import TrackableByCategoryFilterCard from "@perfice/components/journal/search/types/trackable/filters/TrackableByCategoryFilterCard.svelte";
    import TrackableByAnswersFilterCard from "./filters/TrackableByAnswersFilterCard.svelte";
    import type { Trackable } from "@perfice/model/trackable/trackable";
    import type { Form } from "@perfice/model/form/form";

    let {
        filter,
        onChange,
        onDelete,
        dependencies,
        selectedTrackables,
    }: {
        filter: TrackableSearchFilter;
        onChange: (filter: TrackableSearchFilter) => void;
        onDelete: () => void;
        dependencies: JournalSearchUiDependencies;
        selectedTrackables: Set<[Trackable, Form]>;
    } = $props();

    let FILTER_RENDERERS: Record<
        TrackableSearchFilterType,
        Component<{
            filter: any;
            onChange: (filter: any) => void;
            onDelete: () => void;
            dependencies: JournalSearchUiDependencies;
            selectedTrackables: Set<[Trackable, Form]>;
        }>
    > = {
        [TrackableSearchFilterType.ONE_OF]: TrackableOneOfFilterCard,
        [TrackableSearchFilterType.BY_CATEGORY]: TrackableByCategoryFilterCard,
        [TrackableSearchFilterType.BY_ANSWERS]: TrackableByAnswersFilterCard,
    };

    const RendererComponent = $derived(FILTER_RENDERERS[filter.type]);
</script>

<RendererComponent
    filter={filter.value}
    {onDelete}
    onChange={(value) => onChange({ ...filter, value })}
    {dependencies}
    {selectedTrackables}
/>


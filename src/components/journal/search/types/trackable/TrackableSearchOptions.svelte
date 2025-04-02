<script lang="ts">
    import {
        TrackableSearchFilterType,
        type TrackableSearch,
        type TrackableSearchFilter,
    } from "@perfice/model/journal/search/trackable";
    import TrackableFilterRenderer from "@perfice/components/journal/search/types/trackable/TrackableFilterRenderer.svelte";
    import {
        deleteIdentifiedInArray,
        updateIdentifiedInArray,
    } from "@perfice/util/array";
    import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";
    import type { Trackable } from "@perfice/model/trackable/trackable";
    import type { Form } from "@perfice/model/form/form";

    let {
        options,
        onChange,
        dependencies,
    }: {
        options: TrackableSearch;
        onChange: (search: TrackableSearch) => void;
        dependencies: JournalSearchUiDependencies;
    } = $props();

    function onFilterChange(filter: TrackableSearchFilter) {
        onChange({
            ...options,
            filters: updateIdentifiedInArray(options.filters, filter),
        });
    }

    function onFilterDelete(filter: TrackableSearchFilter) {
        onChange({
            ...options,
            filters: deleteIdentifiedInArray(options.filters, filter.id),
        });
    }

    function getSelectedTrackables(
        options: TrackableSearch,
    ): Set<[Trackable, Form]> {
        let result: Set<[Trackable, Form]> = new Set();
        for (let filter of options.filters) {
            if (filter.type == TrackableSearchFilterType.ONE_OF) {
                for (let trackableId of filter.value.values) {
                    let trackable = dependencies.trackables.find(
                        (t) => t.id == trackableId,
                    );
                    if (trackable == null) continue;

                    let form = dependencies.forms.find(
                        (f) => f.id == trackable.formId,
                    );
                    if (form == null) continue;

                    result.add([trackable, form]);
                }
            }
        }

        return result;
    }

    let selectedTrackables = $derived(getSelectedTrackables(options));
</script>

{#each options.filters as filter (filter.id)}
    <TrackableFilterRenderer
        {filter}
        onChange={onFilterChange}
        {dependencies}
        {selectedTrackables}
        onDelete={() => onFilterDelete(filter)}
    />
{/each}

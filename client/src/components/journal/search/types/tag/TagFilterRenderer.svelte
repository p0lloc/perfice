<script lang="ts">
	import {
		type TagSearchFilter,
		TagSearchFilterType,
	} from "@perfice/model/journal/search/tag";
	import type { Component } from "svelte";
	import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";
	import TagOneOfFilterCard from "@perfice/components/journal/search/types/tag/filters/TagOneOfFilterCard.svelte";
	import TagByCategoryFilterCard from "@perfice/components/journal/search/types/tag/filters/TagByCategoryFilterCard.svelte";

	let {
		filter,
		onChange,
		onDelete,
		dependencies,
	}: {
		filter: TagSearchFilter;
		onChange: (filter: TagSearchFilter) => void;
		onDelete: () => void;
		dependencies: JournalSearchUiDependencies;
	} = $props();

	let FILTER_RENDERERS: Record<
		TagSearchFilterType,
		Component<{
			filter: any;
			onChange: (filter: any) => void;
			onDelete: () => void;
			dependencies: JournalSearchUiDependencies;
		}>
	> = {
		[TagSearchFilterType.ONE_OF]: TagOneOfFilterCard,
		[TagSearchFilterType.BY_CATEGORY]: TagByCategoryFilterCard,
	};

	const RendererComponent = $derived(FILTER_RENDERERS[filter.type]);
</script>

<RendererComponent
	filter={filter.value}
	{onDelete}
	onChange={(value) => onChange({ ...filter, value })}
	{dependencies}
/>

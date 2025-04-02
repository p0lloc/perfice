<script lang="ts">
	import type { ByCategoryFilter } from "@perfice/model/journal/search/search";
	import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";
	import ByCategoryFilterCard from "@perfice/components/journal/search/common/ByCategoryFilterCard.svelte";
	import { UNCATEGORIZED_NAME } from "@perfice/util/category";

	let {
		filter,
		onChange,
		onDelete,
		dependencies,
	}: {
		filter: ByCategoryFilter;
		onChange: (filter: ByCategoryFilter) => void;
		onDelete: () => void;
		dependencies: JournalSearchUiDependencies;
	} = $props();

	let items = [
		{ name: UNCATEGORIZED_NAME, value: null },
		...dependencies.tagCategories.map((t) => ({
			name: t.name,
			value: t.id,
		})),
	];
</script>

<ByCategoryFilterCard {items} {onDelete} {onChange} {filter} />

<script lang="ts">
	import type { OneOfFilter } from "@perfice/model/journal/search/search";
	import type { JournalSearchUiDependencies } from "@perfice/model/journal/search/ui";
	import OneOfFilterCard from "@perfice/components/journal/search/common/OneOfFilterCard.svelte";

	let {
		filter,
		onChange,
		onDelete,
		dependencies,
	}: {
		filter: OneOfFilter;
		onChange: (filter: OneOfFilter) => void;
		onDelete: () => void;
		dependencies: JournalSearchUiDependencies;
	} = $props();
</script>

<OneOfFilterCard
	items={dependencies.tags.map((t) => ({ name: t.name, value: t.id }))}
	{onDelete}
	{onChange}
	{filter}
/>

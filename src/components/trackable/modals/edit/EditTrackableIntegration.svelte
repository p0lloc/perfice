<script lang="ts">
	import { type EditTrackableState } from "@perfice/model/trackable/ui";
	import { integrations } from "@perfice/stores";
	import CardButton from "@perfice/components/base/button/CardButton.svelte";
	let {
		editState,
		close,
	}: { editState: EditTrackableState; close: () => void } = $props();

	let integrationTypes = $state(integrations.getIntegrationTypes());
</script>

{#await integrationTypes then val}
	{#each val as type}
		<CardButton title={type.name}></CardButton>
	{/each}
{/await}

<script lang="ts">
	let { coefficient }: { coefficient: number } = $props();
</script>

<div class="flex">
	{#if coefficient > 0}
		<div class="flex-1"></div>
	{/if}
	<div class="flex-1 flex {coefficient < 0 ? 'justify-end text-right' : ''}">
		<div class="w-full">
			<div class="flex {coefficient < 0 ? 'justify-end' : ''}">
				<div
					class="{coefficient > 0
						? 'bg-green-500'
						: 'bg-red-500'} p-2 rounded-md"
					style="width: {Math.abs(coefficient) * 100}%"
				></div>
			</div>
		</div>
	</div>

	{#if coefficient < 0}
		<div class="flex-1"></div>
	{/if}
</div>

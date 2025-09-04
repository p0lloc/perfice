<script lang="ts">
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

<span class="bg-blue-500 text-white px-1 rounded-md">
	{@render children()}
</span>

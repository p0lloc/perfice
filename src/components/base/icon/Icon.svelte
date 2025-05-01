<script lang="ts">
	// noinspection ES6UnusedImports
	import Fa from "svelte-fa";

	let {class: className = "text-xl", name}: { name: string, class?: string } = $props();
</script>

<span class={`${className} flex items-center justify-center aspect-square min-w-4 openmoji`}>
	{name}
    <!--	<Fa icon={ICONS[name] ?? faStar}></Fa>-->
</span>

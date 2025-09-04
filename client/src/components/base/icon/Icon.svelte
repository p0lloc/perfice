<script lang="ts">
    let {class: className = "text-xl", name}: { name: string, class?: string } = $props();
</script>

<span class={`${className} flex items-center justify-center aspect-square min-w-4 openmoji`}>
	{name !== "" ? name : "\u2b50\ufe0f"}
</span>

<script lang="ts">
    import {faStar} from "@fortawesome/free-regular-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {ICONS} from "./icons";

    let {class: className, name}: { name: string, class?: string } = $props();
</script>

<span class={`${className} flex items-center justify-center min-w-4`}>
	<Fa icon={ICONS[name] ?? faStar}></Fa>
</span>

<script lang="ts">
    import {faCalendar, type IconDefinition} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {title, icon = faCalendar}: {
        title: string,
        icon?: IconDefinition
    } = $props();
</script>
<div class="hidden md:flex gap-4 items-center">
    <Fa icon={icon} class="text-4xl text-green-600"/>
    <h1 class="text-4xl font-bold text-center">{title}</h1>
</div>

<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {SidebarLink} from "@perfice/model/ui/sidebar";
    import {goto} from "@mateothegreat/svelte5-router";
    import {toggleDrawer} from "@perfice/stores/ui/drawer";

    let {link, active}: { link: SidebarLink, active: boolean } = $props();

    function onClick() {
        goto(link.path);
        toggleDrawer();
    }
</script>

<button class="flex p-3 row-gap hover-feedback w-full"
        class:text-gray-500={!active} class:text-green-500={active}
        onclick={onClick}>
    <Fa class="w-6" icon={link.icon}/>
    <span>{link.title}</span>
</button>

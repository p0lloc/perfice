<script lang="ts">
    import type {SidebarLink} from "@perfice/model/ui/sidebar";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {goto} from "@mateothegreat/svelte5-router";

    let {link, active}: { link: SidebarLink, active: boolean } = $props();

    function onClick() {
        goto(link.path);
    }

    function getActiveClass(active: boolean) {
        if (active) {
            return "text-green-600 md:bg-green-700";
        } else {
            return "md:bg-green-600 text-gray-600";
        }
    }
</script>
<button onclick={onClick}
        class:hidden={link.showOnMobile === false}
        class:flex={link.showOnMobile === undefined || link.showOnMobile}
        class="md:flex flex-col items-center flex-1 md:flex-auto {getActiveClass(active)} md:hover:bg-green-700 md:w-10 md:h-10
         md:text-white justify-center rounded-xl text-xl">
    <Fa icon={link.icon}></Fa>
    <span class="text-xs md:hidden block">{link.title}</span>
</button>

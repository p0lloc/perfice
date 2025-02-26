<script lang="ts">
    import {
        getCurrentRoute,
        routingNavigatorState,
    } from "@perfice/model/ui/router.svelte";
    import { SIDEBAR_LINKS } from "@perfice/model/ui/sidebar";
    import SidebarButton from "@perfice/components/sidebar/SidebarButton.svelte";
</script>

<div
    class="md:min-h-screen max-h-screen left-0 md:static fixed bg-gray-100 md:bg-green-500 md:w-14 w-screen px-6 py-2 md:p-2 bottom-0 z-50"
>
    <div class="flex md:flex-col justify-between items-center gap-2">
        {#each SIDEBAR_LINKS as link}
            <SidebarButton
                {link}
                active={link.path === getCurrentRoute(routingNavigatorState)}
            />
        {/each}
    </div>
</div>

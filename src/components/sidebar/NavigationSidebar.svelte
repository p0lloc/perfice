<script lang="ts">
    import {getCurrentRoute, routingNavigatorState,} from "@perfice/model/ui/router.svelte.js";
    import {SIDEBAR_LINKS} from "@perfice/model/ui/sidebar";
    import SidebarButton from "@perfice/components/sidebar/SidebarButton.svelte";

    let {hideBottomBar}: { hideBottomBar: boolean } = $props();
</script>

<!-- Dummy container to fill up the space, "sticky" doesn't work since it won't follow scrolling -->
<div class="md:w-14"></div>
<div
        class:hidden={hideBottomBar}
        class="md:min-h-screen left-0 fixed bg-white border-t md:border-0 md:bg-green-500 md:w-14 w-screen px-2 py-2 md:p-2 bottom-0 z-[150]"
>
    <div class="grid grid-cols-5 md:flex md:flex-col justify-between items-center gap-2">
        {#each SIDEBAR_LINKS as link}
            <SidebarButton
                    {link}
                    active={link.path === getCurrentRoute(routingNavigatorState)}
            />
        {/each}
    </div>
</div>

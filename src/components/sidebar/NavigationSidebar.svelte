<script lang="ts">
    import {getCurrentRoute, routingNavigatorState,} from "@perfice/model/ui/router.svelte.js";
    import {SIDEBAR_LINKS, type SidebarLink} from "@perfice/model/ui/sidebar";
    import SidebarButton from "@perfice/components/sidebar/SidebarButton.svelte";

    let {hideBottomBar}: { hideBottomBar: boolean } = $props();

    function getMobileGridSize() {
        return SIDEBAR_LINKS.filter(link =>
            link.showOnMobile !== false
            && link.bottom !== true).length;
    }

    function getLinks() {
        let top: SidebarLink[] = [];
        let bottom: SidebarLink[] = [];
        for (let link of SIDEBAR_LINKS) {
            if (link.bottom) {
                bottom.push(link);
            } else {
                top.push(link);
            }
        }

        return {top, bottom};
    }

    let {top, bottom} = getLinks();
</script>

<!-- Dummy container to fill up the space, "sticky" doesn't work since it won't follow scrolling -->
<div class="md:w-14"></div>
<div
        class:hidden={hideBottomBar}
        class="md:flex md:min-h-screen left-0 fixed bg-white border-t md:border-0 md:bg-green-500
        md:w-14 w-screen px-2 py-2 md:p-2 bottom-0 z-[150] flex flex-col justify-between"
>
    <div class="grid md:flex md:flex-col justify-between items-center gap-2"
         style:grid-template-columns="repeat({getMobileGridSize()}, minmax(0, 1fr))">
        {#each top as link}
            <SidebarButton
                    {link}
                    active={link.path === getCurrentRoute(routingNavigatorState)}
            />
        {/each}
    </div>
    <div>
        {#each bottom as link}
            <SidebarButton
                    {link}
                    active={link.path === getCurrentRoute(routingNavigatorState)}
            />
        {/each}
    </div>
</div>

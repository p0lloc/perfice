<script lang="ts">
    import {fly} from "svelte/transition";
    import {closeDrawer, drawerOpen} from "@perfice/stores/ui/drawer";
    import {SIDEBAR_LINKS} from "@perfice/model/ui/sidebar";
    import DrawerButton from "@perfice/components/sidebar/drawer/DrawerButton.svelte";
    import {getCurrentRoute, routingNavigatorState} from "@perfice/model/ui/router.svelte.js";

    function onBodyClick() {
        closeDrawer();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key !== "Escape") return;
        closeDrawer();
    }
</script>

<svelte:body onclick={onBodyClick}/>
{#if $drawerOpen}
    <!-- Placed separately since we don't want transitions on it -->
    <div class="modal-bg"></div>
{/if}

{#if $drawerOpen}
    <!-- svelte-ignore a11y_no_static_element_interactions (Needed for backdrop click to close modal, we also provide Close button for A11y) -->
    <div transition:fly={{ x: '-100%', opacity: 100, duration: 120 }}
         class="fixed h-screen left-0 bg-white w-[80vw] z-[1600] border-r drawer"
         onkeydown={onKeydown}
         onclick={(e) => e.stopPropagation()}
    >
        {#each SIDEBAR_LINKS as link}
            <DrawerButton {link}
                          active={link.path === getCurrentRoute(routingNavigatorState)}
            />
        {/each}
    </div>
{/if}


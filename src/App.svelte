<script lang="ts">
    import { appReady } from "./main";
    import type { Route } from "@mateothegreat/svelte5-router";
    import { Router } from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/TrackableView.svelte";
    import FormEditorView from "@perfice/views/FormEditorView.svelte";
    import { closeContextMenus } from "@perfice/model/ui/context-menu";
    import JournalView from "@perfice/views/JournalView.svelte";
    import NavigationSidebar from "@perfice/components/sidebar/NavigationSidebar.svelte";
    import GoalView from "@perfice/views/GoalView.svelte";
    import GoalEditorView from "@perfice/views/GoalEditorView.svelte";
    import { routingNavigatorState } from "@perfice/model/ui/router.svelte";
    import TagsView from "@perfice/views/TagsView.svelte";
    import { clearClosables } from "./model/ui/modal";

    const routes: Route[] = [
        { path: "/forms/(?<formId>.*)", component: FormEditorView },
        { path: "/goals/(?<goalId>.*)", component: GoalEditorView },
        { path: "/tags", component: TagsView },
        { path: "/journal", component: JournalView },
        { path: "/goals", component: GoalView },
        { path: "/", component: TrackableView },
    ];

    function onBodyClick(e: MouseEvent) {
        closeContextMenus(e.target as HTMLElement);
    }

    function onRouterRoute(r: Route) {
        clearClosables(); // Any overlays like modals don't matter if we move to a new route
        routingNavigatorState.push(r.path.toString());
        return r;
    }
</script>

<svelte:body onclick={onBodyClick} />
{#if $appReady}
    <div class="flex">
        <NavigationSidebar />
        <div class="flex-1">
            <Router post={onRouterRoute} {routes} />
        </div>
    </div>
{/if}

<style>
</style>

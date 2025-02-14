<script lang="ts">
    import {appReady} from "./main";
    import type {Route} from "@mateothegreat/svelte5-router";
    import {Router} from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/TrackableView.svelte";
    import FormEditorView from "@perfice/views/FormEditorView.svelte";
    import {closeContextMenus} from "@perfice/model/ui/context-menu";
    import JournalView from "@perfice/views/JournalView.svelte";
    import Sidebar from "@perfice/components/sidebar/Sidebar.svelte";
    import GoalView from "@perfice/views/GoalView.svelte";
    import GoalEditorView from "@perfice/views/GoalEditorView.svelte";
    import {routingNavigatorState} from "@perfice/model/ui/router.svelte";

    const routes: Route[] = [
        {path: "/forms/(?<formId>.*)", component: FormEditorView},
        {path: "/goals/(?<goalId>.*)", component: GoalEditorView},
        {path: "/journal", component: JournalView},
        {path: "/goals", component: GoalView},
        {path: "/", component: TrackableView},
    ]

    function onBodyClick(e: MouseEvent) {
        closeContextMenus(e.target as HTMLElement);
    }

    function onRouterRoute(r: Route) {
        routingNavigatorState.push(r.path.toString());
        return r;
    }
</script>

<svelte:body onclick={onBodyClick}/>
{#if $appReady}
    <div class="flex">
        <Sidebar/>
        <div class="flex-1">
            <Router post={onRouterRoute} {routes}/>
        </div>
    </div>
{/if}

<style>
</style>

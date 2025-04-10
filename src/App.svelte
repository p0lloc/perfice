<script lang="ts">
    import { appReady } from "./app";
    import type { Route } from "@mateothegreat/svelte5-router";
    import { Router } from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/trackable/TrackableView.svelte";
    import FormEditorView from "@perfice/views/form/FormEditorView.svelte";
    import { closeContextMenus } from "@perfice/model/ui/context-menu";
    import JournalView from "@perfice/views/journal/JournalView.svelte";
    import NavigationSidebar from "@perfice/components/sidebar/NavigationSidebar.svelte";
    import GoalView from "@perfice/views/goal/GoalView.svelte";
    import GoalEditorView from "@perfice/views/goal/GoalEditorView.svelte";
    import { routingNavigatorState } from "@perfice/model/ui/router.svelte.js";
    import TagsView from "@perfice/views/tag/TagsView.svelte";
    import { clearClosables } from "./model/ui/modal";
    import AnalyticsView from "@perfice/views/analytics/AnalyticsView.svelte";
    import AnalyticsDetailView from "@perfice/views/analytics/AnalyticsDetailView.svelte";
    import DashboardView from "@perfice/views/dashboard/DashboardView.svelte";
    import QuickLogField from "@perfice/components/QuickLogField.svelte";
    import ReflectionListView from "@perfice/views/reflection/ReflectionListView.svelte";
    import ReflectionEditorView from "@perfice/views/reflection/ReflectionEditorView.svelte";
    import JournalSearchView from "@perfice/views/journal/JournalSearchView.svelte";
    import MobileDrawer from "@perfice/components/sidebar/drawer/MobileDrawer.svelte";
    import GlobalReflectionModal from "@perfice/components/reflection/GlobalReflectionModal.svelte";

    const routes: Route[] = [
        { path: "/forms/(?<formId>.*)", component: FormEditorView },
        { path: "/goals/(?<goalId>.*)", component: GoalEditorView },
        { path: "/tags", component: TagsView },
        { path: "/journal/search", component: JournalSearchView },
        { path: "/journal/(?<search>.*)", component: JournalView },
        { path: "/journal", component: JournalView },
        { path: "/analytics/(?<subject>.*)", component: AnalyticsDetailView },
        { path: "/analytics", component: AnalyticsView },
        { path: "/goals", component: GoalView },
        { path: "/trackables", component: TrackableView },
        {
            path: "/reflections/(?<reflectionId>.*)",
            component: ReflectionEditorView,
        },
        { path: "/reflections", component: ReflectionListView },
        { path: "/", component: DashboardView },
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
    <GlobalReflectionModal />
    <div class="flex main-container">
        <NavigationSidebar />
        <MobileDrawer />
        <div class="flex-1">
            <Router post={onRouterRoute} {routes} />
        </div>
    </div>
{/if}

<QuickLogField />

<style>
    .inp {
        @apply py-4;
    }
</style>

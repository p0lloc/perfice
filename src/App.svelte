<script lang="ts">
    import {appReady} from "./stores";
    import type {Route} from "@mateothegreat/svelte5-router";
    import {Router} from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/trackable/TrackableView.svelte";
    import FormEditorView from "@perfice/views/form/FormEditorView.svelte";
    import {closeContextMenus} from "@perfice/model/ui/context-menu";
    import JournalView from "@perfice/views/journal/JournalView.svelte";
    import NavigationSidebar from "@perfice/components/sidebar/NavigationSidebar.svelte";
    import GoalView from "@perfice/views/goal/GoalView.svelte";
    import GoalEditorView from "@perfice/views/goal/GoalEditorView.svelte";
    import {routingNavigatorState} from "@perfice/model/ui/router.svelte.js";
    import TagsView from "@perfice/views/tag/TagsView.svelte";
    import {clearClosables} from "./model/ui/modal";
    import AnalyticsView from "@perfice/views/analytics/AnalyticsView.svelte";
    import AnalyticsDetailView from "@perfice/views/analytics/AnalyticsDetailView.svelte";
    import DashboardView from "@perfice/views/dashboard/DashboardView.svelte";
    import QuickLogField from "@perfice/components/QuickLogField.svelte";
    import ReflectionListView from "@perfice/views/reflection/ReflectionListView.svelte";
    import ReflectionEditorView from "@perfice/views/reflection/ReflectionEditorView.svelte";
    import JournalSearchView from "@perfice/views/journal/JournalSearchView.svelte";
    import MobileDrawer from "@perfice/components/sidebar/drawer/MobileDrawer.svelte";
    import GlobalReflectionModal from "@perfice/components/reflection/GlobalReflectionModal.svelte";
    import OnboardingView from "@perfice/views/onboarding/OnboardingView.svelte";
    import {ONBOARDING_ROUTE} from "@perfice/stores/onboarding/onboarding";
    import SettingsView from "@perfice/views/settings/SettingsView.svelte";
    import {BASE_URL} from "@perfice/app";
    import IntegrationTypesView from "@perfice/views/integration/IntegrationTypesView.svelte";
    import IntegrationEditView from "@perfice/views/integration/IntegrationEditView.svelte";
    import IntegrationCreateView from "@perfice/views/integration/IntegrationCreateView.svelte";
    import GlobalSyncModals from "@perfice/components/sync/GlobalSyncModals.svelte";
    import GlobalIntegrationModals from "@perfice/components/integration/modals/GlobalIntegrationModals.svelte";

    type AppRoute = Route & { hideBottomBar?: boolean, customLayout?: boolean };

    const routes: AppRoute[] = [
        {
            path: "/forms/(?<formId>.*)",
            component: FormEditorView,
            hideBottomBar: true
        },
        {
            path: "/goals/(?<goalId>.*)",
            component: GoalEditorView,
            hideBottomBar: true,
        },
        {path: "/tags", component: TagsView},
        {
            path: "/journal/search/(?<search>.*)",
            component: JournalSearchView,
            hideBottomBar: true,
        },
        {
            path: "/journal/search",
            component: JournalSearchView,
            hideBottomBar: true,
        },
        {
            path: "/journal/(?<search>.*)",
            component: JournalView,
        },
        {path: "/journal", component: JournalView},
        {
            path: "/analytics/(?<subject>.*)",
            component: AnalyticsDetailView,
            hideBottomBar: true,
        },

        {
            path: "/integrations/(?<formId>.*)/create/(?<integrationType>.*)",
            component: IntegrationCreateView,
        },
        {
            path: "/integrations/edit/(?<integrationId>.*)",
            component: IntegrationEditView,
        },
        {
            path: "/integrations/(?<formId>.*)",
            component: IntegrationTypesView,
        },

        {path: "/analytics", component: AnalyticsView},
        {path: "/goals", component: GoalView},
        {path: "/trackables", component: TrackableView},
        {
            path: "/reflections/(?<reflectionId>.*)",
            component: ReflectionEditorView,
            hideBottomBar: true,
        },
        {path: "/reflections", component: ReflectionListView},
        {path: ONBOARDING_ROUTE, component: OnboardingView, customLayout: true},
        {path: "/settings", component: SettingsView},
        {path: "/", component: DashboardView},
    ];

    let customLayout = $state<boolean>(false);
    let hideBottomBar = $state<boolean>(false);

    function onBodyClick(e: MouseEvent) {
        closeContextMenus(e.target as HTMLElement);
    }

    function fillRegexGroups(regexStr: string, params: Record<string, string>) {
        return regexStr.replace(/\(\?<(\w+)>[^)]+\)/g, (_, groupName) => {
            return params[groupName] !== undefined ? params[groupName] : '';
        });
    }

    function onRouterRoute(r: AppRoute) {
        let path = r.path.toString();
        if (r.params != undefined && !Array.isArray(r.params)) {
            path = fillRegexGroups(path, r.params);
        }

        customLayout = r.customLayout ?? false;
        hideBottomBar = r.hideBottomBar ?? false;

        clearClosables(); // Any overlays like modals don't matter if we move to a new route
        routingNavigatorState.push(path);
        return r;
    }
</script>

<svelte:body onclick={onBodyClick}/>
{#if $appReady}
    <div class="flex main-container">
        <GlobalSyncModals/>
        <GlobalIntegrationModals/>
        {#if !customLayout}
            <GlobalReflectionModal/>
            <NavigationSidebar {hideBottomBar}/>
            <MobileDrawer/>
            <QuickLogField/>
        {/if}
        <div class="flex-1">
            <Router basePath={BASE_URL} post={onRouterRoute} {routes}/>
        </div>
    </div>
{/if}
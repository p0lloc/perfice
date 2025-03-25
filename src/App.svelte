<script lang="ts">
    import { appReady, forms, tags } from "./app";
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
    import AnalyticsView from "@perfice/views/AnalyticsView.svelte";
    import AnalyticsDetailView from "@perfice/views/AnalyticsDetailView.svelte";
    import DashboardView from "@perfice/views/DashboardView.svelte";
    import DynamicInput from "@perfice/components/base/dynamic/DynamicInput.svelte";
    import { FormQuestionDisplayType, type Form } from "./model/form/form";
    import type { InputEntity, InputField } from "./model/ui/dynamicInput";
    import { primitiveAsString } from "./model/primitive/primitive";

    const routes: Route[] = [
        { path: "/forms/(?<formId>.*)", component: FormEditorView },
        { path: "/goals/(?<goalId>.*)", component: GoalEditorView },
        { path: "/tags", component: TagsView },
        { path: "/journal", component: JournalView },
        { path: "/analytics/(?<subject>.*)", component: AnalyticsDetailView },
        { path: "/analytics", component: AnalyticsView },
        { path: "/goals", component: GoalView },
        { path: "/trackables", component: TrackableView },
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

    function mapFormsToInputEntities(forms: Form[]): InputEntity[] {
        let res: InputEntity[] = [];
        for (let form of forms) {
            let fields: InputField[] = [];
            for (let question of form.questions) {
                let options = undefined;
                if (question.displayType == FormQuestionDisplayType.SELECT) {
                    options = question.displaySettings.options.map((o) =>
                        primitiveAsString(o.value),
                    );
                }

                fields.push({
                    id: question.id,
                    name: question.name,
                    options,
                });
            }

            res.push({
                id: form.id,
                name: form.name,
                fields,
            });
        }

        return res;
    }
</script>

<svelte:body onclick={onBodyClick} />
{#if $appReady}
    <div class="flex main-container">
        <NavigationSidebar />
        <div class="flex-1">
            <Router post={onRouterRoute} {routes} />
        </div>
    </div>
{/if}

{#await $forms then forms}
    {#await $tags then tags}
        <div
            class="fixed bg-white bottom-12 md:bottom-0 h-16 flex items-center justify-center w-screen border-t px-4"
        >
            <DynamicInput entities={mapFormsToInputEntities(forms)} />
        </div>
    {/await}
{/await}

<style>
    .inp {
        @apply py-4;
    }
</style>

<script lang="ts">
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";
    import type {Component} from "svelte";
    import {type ReflectionSidebarAction, ReflectionSidebarActionType} from "@perfice/model/reflection/ui";
    import ReflectionEditPageSidebar
        from "@perfice/components/reflection/editor/sidebar/ReflectionEditPageSidebar.svelte";
    import ReflectionEditWidgetSidebar
        from "@perfice/components/reflection/editor/sidebar/ReflectionEditWidgetSidebar.svelte";

    let action: ReflectionSidebarAction | null = $state<ReflectionSidebarAction | null>(
        null,
    );

    let sidebar: Sidebar;

    export function open(sidebarAction: ReflectionSidebarAction) {
        sidebar.open();
        action = sidebarAction;
    }

    const RENDERERS: Record<
        ReflectionSidebarActionType,
        Component<{ action: any }>
    > = {
        [ReflectionSidebarActionType.EDIT_PAGE]: ReflectionEditPageSidebar,
        [ReflectionSidebarActionType.EDIT_WIDGET]: ReflectionEditWidgetSidebar,
    };

    const SIDEBAR_TITLES = {
        [ReflectionSidebarActionType.EDIT_PAGE]: "Edit page",
        [ReflectionSidebarActionType.EDIT_WIDGET]: "Edit widget",
    };

    export function close() {
        sidebar.close();
    }

    const RendererComponent = $derived(
        action != null ? RENDERERS[action.type] : null,
    );
</script>

<Sidebar
        title={SIDEBAR_TITLES[action?.type ?? ReflectionSidebarActionType.EDIT_WIDGET]}
        bind:this={sidebar}
>
    {#if action != null}
        <div class="p-4">
            <RendererComponent action={action.value}/>
        </div>
    {/if}
</Sidebar>

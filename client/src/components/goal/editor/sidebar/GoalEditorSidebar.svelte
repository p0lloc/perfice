<script lang="ts">
    import {
        type GoalSidebarAction,
        GoalSidebarActionType,
    } from "@perfice/model/goal/ui";
    import type { Component } from "svelte";
    import AddSourceSidebar from "@perfice/components/goal/editor/sidebar/AddSourceSidebar.svelte";
    import AddConditionSidebar from "@perfice/components/goal/editor/sidebar/AddConditionSidebar.svelte";
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";

    let action: GoalSidebarAction | null = $state<GoalSidebarAction | null>(
        null,
    );

    let sidebar: Sidebar;

    export function open(sidebarAction: GoalSidebarAction) {
        sidebar.open();
        action = sidebarAction;
    }

    const RENDERERS: Record<
        GoalSidebarActionType,
        Component<{ action: any; onClose: () => void }>
    > = {
        [GoalSidebarActionType.ADD_SOURCE]: AddSourceSidebar,
        [GoalSidebarActionType.ADD_CONDITION]: AddConditionSidebar,
    };

    const SIDEBAR_TITLES = {
        [GoalSidebarActionType.ADD_SOURCE]: "Add source",
        [GoalSidebarActionType.ADD_CONDITION]: "Add condition",
    };

    export function close() {
        sidebar.close();
    }

    const RendererComponent = $derived(
        action != null ? RENDERERS[action.type] : null,
    );
</script>

<Sidebar
    title={SIDEBAR_TITLES[action?.type ?? GoalSidebarActionType.ADD_CONDITION]}
    bind:this={sidebar}
>
    {#if action != null}
        <div class="p-4">
            <RendererComponent action={action.value} onClose={close} />
        </div>
    {/if}
</Sidebar>

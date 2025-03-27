<script lang="ts">
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";
    import type {Component} from "svelte";
    import {type DashboardSidebarAction, DashboardSidebarActionType} from "@perfice/model/dashboard/ui";
    import AddWidgetSidebar from "@perfice/components/dashboard/sidebar/add/AddWidgetSidebar.svelte";
    import EditWidgetSidebar from "@perfice/components/dashboard/sidebar/edit/EditWidgetSidebar.svelte";

    let action: DashboardSidebarAction | null = $state<DashboardSidebarAction | null>(
        null,
    );

    let {onClose}: { onClose: () => void } = $props();

    let sidebar: Sidebar;

    export function open(sidebarAction: DashboardSidebarAction) {
        sidebar.open();
        action = sidebarAction;
    }

    const RENDERERS: Record<
        DashboardSidebarActionType,
        Component<{ action: any; }>
    > = {
        [DashboardSidebarActionType.ADD_WIDGET]: AddWidgetSidebar,
        [DashboardSidebarActionType.EDIT_WIDGET]: EditWidgetSidebar,
    };

    const SIDEBAR_TITLES = {
        [DashboardSidebarActionType.ADD_WIDGET]: "Add widget",
        [DashboardSidebarActionType.EDIT_WIDGET]: "Edit widget",
    };

    export function close() {
        sidebar.close();
    }

    const RendererComponent = $derived(
        action != null ? RENDERERS[action.type] : null,
    );
</script>

<Sidebar
        title={SIDEBAR_TITLES[action?.type ?? DashboardSidebarActionType.ADD_WIDGET]}
        {onClose}
        bind:this={sidebar}
>
    {#if action != null}
        <div class="p-4 pb-20 flex-1 overflow-y-scroll scrollbar-hide">
            <RendererComponent action={action.value}/>
        </div>
    {/if}
</Sidebar>

<script lang="ts">
    import {type GoalSidebarAction, GoalSidebarActionType} from "@perfice/model/goal/ui";
    import type {Component} from "svelte";
    import AddSourceSidebar from "@perfice/components/goal/editor/sidebar/AddSourceSidebar.svelte";
    import AddConditionSidebar from "@perfice/components/goal/editor/sidebar/AddConditionSidebar.svelte";

    let action: GoalSidebarAction | null = $state<GoalSidebarAction | null>(null);

    export function open(sidebarAction: GoalSidebarAction) {
        action = sidebarAction;
    }

    const RENDERERS: Record<GoalSidebarActionType, Component<{ action: any, onClose: () => void }>> = {
        [GoalSidebarActionType.ADD_SOURCE]: AddSourceSidebar,
        [GoalSidebarActionType.ADD_CONDITION]: AddConditionSidebar,
    };

    export function close(){
        action = null;
    }

    const RendererComponent = $derived(action != null ? RENDERERS[action.type] : null);
</script>

{#if action != null}
    <div class="right-sidebar md:w-96 p-4">
        <RendererComponent action={action.value} onClose={close}/>
    </div>
{/if}

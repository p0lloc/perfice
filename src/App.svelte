<script lang="ts">
    import {appReady} from "./main";
    import type {Route} from "@mateothegreat/svelte5-router";
    import {Router} from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/TrackableView.svelte";
    import FormEditorView from "@perfice/views/FormEditorView.svelte";
    import {closeContextMenus} from "@perfice/model/ui/context-menu";

    const routes: Route[] = [
        {path: "/forms/(?<formId>.*)", component: FormEditorView},
        {path: "/", component: TrackableView},
    ]

    function onBodyClick() {
        closeContextMenus();
    }
</script>

<svelte:body onclick={onBodyClick}/>
{#if $appReady}
    <Router {routes}/>
{/if}

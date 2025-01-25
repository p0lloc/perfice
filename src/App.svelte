<script lang="ts">
    import {appReady} from "./main";
    import type {Route} from "@mateothegreat/svelte5-router";
    import {Router} from "@mateothegreat/svelte5-router";
    import TrackableView from "@perfice/views/TrackableView.svelte";
    import FormEditorView from "@perfice/views/FormEditorView.svelte";
    import {closeContextMenus} from "@perfice/model/ui/context-menu";
    import JournalView from "@perfice/views/JournalView.svelte";

    const routes: Route[] = [
        {path: "/forms/(?<formId>.*)", component: FormEditorView},
        {path: "/journal", component: JournalView},
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

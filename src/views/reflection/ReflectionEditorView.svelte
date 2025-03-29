<script lang="ts">
    import {onMount} from "svelte";
    import type {Reflection, ReflectionPage, ReflectionWidget} from "@perfice/model/reflection/reflection";
    import {forms, reflections} from "@perfice/app";
    import {NEW_REFLECTION_ROUTE, ReflectionSidebarActionType} from "@perfice/model/reflection/ui";
    import {faArrowLeft, faCheck} from "@fortawesome/free-solid-svg-icons";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import HorizontalPlusButton from "@perfice/components/base/button/HorizontalPlusButton.svelte";
    import ReflectionPageGroup from "@perfice/components/reflection/editor/ReflectionPageGroup.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {deleteIdentifiedInArray} from "@perfice/util/array";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import ReflectionEditorSidebar from "@perfice/components/reflection/editor/sidebar/ReflectionEditorSidebar.svelte";
    import {goto} from "@mateothegreat/svelte5-router";

    let {params}: { params: Record<string, string> } = $props();
    let reflection = $state<Reflection | undefined>(undefined);
    let editing = $state(false);
    let sidebar: ReflectionEditorSidebar;

    onMount(() => {
        loadReflection();
    })

    function back() {
        goto("/reflections");
    }

    async function save() {
        if (reflection == undefined) return;
        let value = $state.snapshot(reflection);
        if (editing) {
            await reflections.updateReflection(value);
        } else {
            await reflections.createReflection(value);
        }

        goto("/reflections");
    }

    function createPage() {
        if (reflection == undefined) return;
        reflection.pages.push({
            id: crypto.randomUUID(),
            name: "New page",
            icon: null,
            description: "",
            widgets: []
        });
    }

    function onEditPage(page: ReflectionPage) {
        sidebar.open({
            type: ReflectionSidebarActionType.EDIT_PAGE,
            value: {
                page
            }
        });
    }

    function closeSidebar(e: MouseEvent) {
        let target = e.target as HTMLElement;
        if (target.tagName == "BUTTON") return;
        sidebar.close();
    }

    function onDeletePage(page: ReflectionPage) {
        if (reflection == undefined) return;
        reflection.pages = deleteIdentifiedInArray(reflection.pages, page.id);
    }

    async function onEditWidget(widget: ReflectionWidget) {
        sidebar.open({
            type: ReflectionSidebarActionType.EDIT_WIDGET,
            value: {
                widget,
                forms: await forms.get()
            }
        });
    }

    async function loadReflection() {
        let reflectionId = params.reflectionId;
        if (reflectionId == NEW_REFLECTION_ROUTE) {
            reflection = {
                id: crypto.randomUUID(),
                name: "New reflection",
                pages: []
            };
            editing = false;
        } else {
            reflection = await reflections.fetchReflectionById(reflectionId);
            editing = true;
        }
    }
</script>

<ReflectionEditorSidebar bind:this={sidebar}/>
<svelte:body onclick={closeSidebar}/>
{#if reflection !== undefined}
    <MobileTopBar title={"Edit reflection"}>
        {#snippet leading()}
            <button class="icon-button" onclick={back}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            <button class="icon-button" onclick={save}>
                <Fa icon={faCheck}/>
            </button>
        {/snippet}
    </MobileTopBar>
    <div class="md:w-1/2 mx-auto md:mt-8 md:p-0 p-4 main-content">
        <h2 class="text-3xl font-bold hidden md:block">Edit reflection</h2>

        <div class="flex md:flex-col justify-between gap-2 md:mt-8 items-center md:items-start">
            <h3 class="label">Name</h3>
            <input type="text" bind:value={reflection.name} placeholder="Name"/>
        </div>
        <h3 class="label text-2xl mt-4">Pages</h3>
        <div class="flex flex-col mt-2 gap-2">
            {#each reflection.pages as page(page.id)}
                <ReflectionPageGroup onEdit={() => onEditPage(page)} onDelete={() => onDeletePage(page)}
                                     onEditWidget={(widget) => onEditWidget(widget)}
                                     {page}/>
            {/each}
        </div>
        <HorizontalPlusButton onClick={createPage}></HorizontalPlusButton>
        <div class="hidden md:block mt-10">
            <Button onClick={save}>Save</Button>
            <Button color={ButtonColor.RED} onClick={back}>
                Cancel
            </Button>
        </div>
    </div>

{:else}
    <h1>Reflection not found</h1>
{/if}

<style>
    .label {
        @apply text-lg md:text-2xl font-bold text-gray-700;
    }
</style>
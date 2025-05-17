<script lang="ts">
    import {onMount} from "svelte";
    import {
        type Reflection,
        REFLECTION_AUTO_OPEN_TYPES,
        ReflectionAutoOpenType,
        type ReflectionPage,
        type ReflectionWidget
    } from "@perfice/model/reflection/reflection";
    import {NEW_REFLECTION_ROUTE, ReflectionSidebarActionType} from "@perfice/model/reflection/ui";
    import {faArrowLeft, faCheck} from "@fortawesome/free-solid-svg-icons";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import HorizontalPlusButton from "@perfice/components/base/button/HorizontalPlusButton.svelte";
    import ReflectionPageGroup from "@perfice/components/reflection/editor/ReflectionPageGroup.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import ReflectionEditorSidebar from "@perfice/components/reflection/editor/sidebar/ReflectionEditorSidebar.svelte";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import type {StoredNotification} from "@perfice/model/notification/notification";
    import EditReflectionNotifications
        from "@perfice/components/reflection/editor/notifications/EditReflectionNotifications.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {forms, reflections} from "@perfice/stores";
    import {navigate} from "@perfice/app";

    let {params}: { params: Record<string, string> } = $props();
    let reflection = $state<Reflection | undefined>(undefined);
    let notifications = $state<StoredNotification[]>([]);
    let editing = $state(false);
    let sidebar: ReflectionEditorSidebar;
    let dragContainer: DragAndDropContainer;

    onMount(() => {
        loadReflection();
    })

    function back() {
        navigate("/reflections");
    }

    async function save() {
        if (reflection == undefined) return;
        let value = $state.snapshot(reflection);
        if (editing) {
            await reflections.updateReflection(value);
        } else {
            await reflections.createReflection(value);
        }

        navigate("/reflections");
    }

    function createPage() {
        if (reflection == undefined) return;
        reflection.pages.push({
            id: crypto.randomUUID(),
            name: "New page",
            icon: "\ud83c\udf19",
            description: "",
            widgets: []
        });
        dragContainer.invalidateItems();
    }

    function onEditPage(page: ReflectionPage) {
        sidebar.open({
            type: ReflectionSidebarActionType.EDIT_PAGE,
            value: {
                page: structuredClone($state.snapshot(page)),
                onChange: (page) => {
                    if (reflection == null) return;
                    reflection.pages = updateIdentifiedInArray(reflection.pages, page)
                    dragContainer.invalidateItems();
                }
            }
        });
    }

    function onDeletePage(page: ReflectionPage) {
        if (reflection == undefined) return;
        reflection.pages = deleteIdentifiedInArray(reflection.pages, page.id);
        dragContainer.invalidateItems();
    }

    async function onEditWidget(widget: ReflectionWidget) {
        sidebar.open({
            type: ReflectionSidebarActionType.EDIT_WIDGET,
            value: {
                widget,
                forms: await forms.get(),
                onChange: (widget) => {
                    if (reflection == null) return;
                    let page = reflection.pages.find(p => p.widgets.some(w => w.id == widget.id));
                    if (page == null) return;

                    reflection.pages = updateIdentifiedInArray(reflection.pages, {
                        ...page,
                        widgets: updateIdentifiedInArray(page.widgets, widget)
                    })
                    dragContainer.invalidateItems();
                }
            }
        });
    }

    async function loadReflection() {
        let reflectionId = params.reflectionId;
        if (reflectionId == NEW_REFLECTION_ROUTE) {
            reflection = {
                id: crypto.randomUUID(),
                name: "New reflection",
                pages: [],
                openType: ReflectionAutoOpenType.DISABLE,
            };
            notifications = [];
            editing = false;
        } else {
            reflection = await reflections.fetchReflectionById(reflectionId);
            notifications = await reflections.getNotificationsForReflection(reflectionId);
            editing = true;
        }
    }

    function onAutoOpenChange(v: ReflectionAutoOpenType) {
        if (reflection == undefined) return;
        reflection.openType = v;
    }

    function onPagesReorder(pages: ReflectionPage[]) {
        if (reflection == undefined) return;
        reflection.pages = pages;
    }
</script>

<ReflectionEditorSidebar bind:this={sidebar}/>
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
    <div class="center-view md:mt-8 md:p-0 p-4 main-content">
        <h2 class="text-3xl font-bold hidden md:block">Edit reflection</h2>

        <div class="flex md:flex-col justify-between gap-2 md:mt-8 items-center md:items-start">
            <h3 class="label">Name</h3>
            <input type="text" bind:value={reflection.name} placeholder="Name"/>
        </div>
        <div class="label-icon mt-4">
            <div class="flex-col flex"><h3 class="label">Auto open</h3>
                <p class="text-xs">Automatically open when the app is opened</p></div>
            <DropdownButton value={reflection.openType} items={REFLECTION_AUTO_OPEN_TYPES} onChange={onAutoOpenChange}/>
        </div>
        {#if editing}
            <div class="mt-4">
                <EditReflectionNotifications {notifications}
                                             entityId={reflection.id}
                                             onChange={(v) => notifications = v}/>
            </div>
        {/if}
        <h3 class="label text-2xl mt-4">Pages</h3>
        <DragAndDropContainer bind:this={dragContainer} zoneId="reflection-pages" items={reflection.pages}
                              class="flex flex-col mt-2 gap-2"
                              dragHandles={true}
                              onFinalize={onPagesReorder}>
            {#snippet item(page)}
                <ReflectionPageGroup onEdit={() => onEditPage(page)} onDelete={() => onDeletePage(page)}
                                     onEditWidget={(widget) => onEditWidget(widget)}
                                     {page}/>
            {/snippet}
        </DragAndDropContainer>
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

    .label-icon {
        @apply flex md:flex-col justify-between gap-2 items-center md:items-start;
    }
</style>
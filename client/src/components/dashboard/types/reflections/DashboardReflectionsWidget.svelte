<script lang="ts">
    import type {DashboardReflectionsWidgetSettings} from "@perfice/model/dashboard/widgets/reflections";
    import DashboardWidgetBase from "@perfice/components/dashboard/DashboardWidgetBase.svelte";
    import {faPlay, faSun} from "@fortawesome/free-solid-svg-icons";
    import {reflections} from "@perfice/stores";
    import {onMount} from "svelte";
    import type {Reflection} from "@perfice/model/reflection/reflection";
    import {publishToEventStore} from "@perfice/util/event";
    import {openReflectionEvents} from "@perfice/model/reflection/ui";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {}: {
        settings: DashboardReflectionsWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();


    function onPlayReflection(reflection: Reflection) {
        publishToEventStore(openReflectionEvents, reflection);
    }

    onMount(() => {
        reflections.load();
    });
</script>

<DashboardWidgetBase icon={faSun} title="Reflections">
    {#await $reflections}
        Loading...
    {:then value}
        <div class="grid grid-cols-2 p-4 gap-2 overflow-y-scroll scrollbar-hide w-full h-full">
            {#each value as reflection}
                <button class="card flex flex-col p-4 gap-2 items-center justify-center hover-feedback"
                        on:click={() => onPlayReflection(reflection)}>
                    <Fa icon={faPlay} size="2x"/>
                    {reflection.name}
                </button>
            {/each}
        </div>
    {/await}
</DashboardWidgetBase>
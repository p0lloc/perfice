<script lang="ts">
    import {reflections} from "@perfice/app";
    import {faBars, faPen, faPlay, faSun, faTrash} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {Reflection} from "@perfice/model/reflection/reflection";
    import {goto} from "@mateothegreat/svelte5-router";
    import {NEW_REFLECTION_ROUTE} from "@perfice/model/reflection/ui";
    import HorizontalPlusButton from "@perfice/components/base/button/HorizontalPlusButton.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import GenericActionsCard from "@perfice/components/base/card/GenericActionsCard.svelte";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import ReflectionModal from "@perfice/components/reflection/modal/ReflectionModal.svelte";

    let deleteReflectionModal: GenericDeleteModal<Reflection>;
    let reflectionModal: ReflectionModal;

    reflections.load();

    function createReflection() {
        goto(`/reflections/${NEW_REFLECTION_ROUTE}`);
    }

    function onStartDeleteReflection(reflection: Reflection) {
        deleteReflectionModal.open(reflection);
    }

    function onDeleteReflection(reflection: Reflection) {
        if (reflection == null) return;
        reflections.deleteReflectionById(reflection.id);
    }

    function onEditReflection(reflection: Reflection) {
        goto(`/reflections/${reflection.id}`);
    }

    function onPlayReflection(reflection: Reflection) {
        reflectionModal.open(reflection);
    }
</script>

<MobileTopBar title="Reflections"/>

<GenericDeleteModal subject="this reflection" onDelete={onDeleteReflection} bind:this={deleteReflectionModal}/>
<ReflectionModal bind:this={reflectionModal}/>
<div class="md:w-1/2 mx-auto md:mt-8 md:p-0 p-2 main-content">
    {#await $reflections}
        Loading...
    {:then value}
        <Title title="Reflections" icon={faSun}/>

        <div class="flex flex-col gap-2 mt-4">
            {#each value as reflection(reflection.id)}
                <GenericActionsCard icon={faSun} text={reflection.name}>
                    {#snippet actions()}
                        <IconButton icon={faPlay} onClick={() => onPlayReflection(reflection)}/>
                        <IconButton icon={faPen} onClick={() => onEditReflection(reflection)}/>
                        <IconButton icon={faTrash} onClick={() => onStartDeleteReflection(reflection)}/>
                    {/snippet}
                </GenericActionsCard>
            {/each}
        </div>
        <HorizontalPlusButton onClick={createReflection}></HorizontalPlusButton>
    {/await}
</div>
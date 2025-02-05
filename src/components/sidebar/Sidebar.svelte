<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faBook, faBullseye, faRuler} from "@fortawesome/free-solid-svg-icons";
    import {goto} from "@mateothegreat/svelte5-router";

    let links = [
        {name: "Trackables", icon: faRuler, path: "/trackables"},
        {name: "Journal", icon: faBook, path: "/journal"},
        {name: "Goals", icon: faBullseye, path: "/goals"},
    ];
</script>

<div class="md:min-h-screen max-h-screen left-0 fixed bg-green-500 md:w-16 w-screen p-2 bottom-0">
    <div class="flex md:flex-col items-center gap-2">
        {#each links as link}
            <button onclick={() => goto(link.path)}
                    class="flex items-center bg-green-600 w-12 h-12 text-white justify-center rounded-xl text-xl">
                <Fa icon={link.icon}></Fa>
            </button>
        {/each}
    </div>
</div>

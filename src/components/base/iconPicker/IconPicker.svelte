<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import {ICONS} from "@perfice/components/base/icon/icons";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let opened = $state(false);
    let resolve: (icon: string) => void;

    export function open(): Promise<string> {
        opened = true;
        return new Promise((res) => resolve = res);
    }

    function close() {
        opened = false;
    }

    function pick(icon: string) {
        resolve(icon);
        close();
    }
</script>

{#if opened}
    <div
            class="fixed bottom-0 left-0 md:left-auto md:bottom-auto w-full md:absolute bg-white z-[200] border md:w-[290px] md:mr-[150px] rounded-md p-4 h-64 overflow-y-scroll"
    >
        <div class="flex justify-end mb-2">
            <button class="pointer-feedback:text-red-700" onclick={close}>
                <Fa icon={faTimes}/>
            </button>
        </div>
        <div class="grid grid-cols-6 md:grid-cols-7">
            {#each Object.keys(ICONS) as key}
                <button
                        class="p-2 pointer-feedback:bg-gray-200 aspect-square inline-flex items-center justify-center"
                        onclick={() => pick(key)}
                >
                    <Icon name={key} class="text-xl"/>
                </button>
            {/each}
        </div>    </div>
{/if}

<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import type {Emoji} from "@perfice/components/base/icon/icons.js";

    let {right = false, icons}: { icons: Emoji[], right?: boolean } = $props();

    const WIDTH = 290;

    let picker: HTMLDivElement | undefined = $state();
    let search = $state("");

    let opened = $state(false);
    let x = $state(0);
    let y = $state(0);
    let resolve: (icon: string) => void;

    export function open(xPos: number, yPos: number, right: boolean = false, scrollTop: number = 0): Promise<string> {
        opened = true;
        search = "";
        x = (right || xPos + WIDTH > window.innerWidth) ? xPos - WIDTH : xPos;
        y = yPos;

        setTimeout(() => {
            if (picker == null) return;
            picker.scrollTop = scrollTop;
        });

        return new Promise((res) => resolve = res);
    }

    function close() {
        opened = false;
    }

    function pick(icon: string) {
        resolve(icon);
        close();
    }


    let emojis = $derived(icons.filter(e => e.annotation.includes(search) || e.tags.includes(search)));
</script>

{#if opened}
    <div
            style:left="{x}px"
            style:top="{y}px"
            style:width="{WIDTH}px"
            bind:this={picker}
            class="fixed w-full picker
             bg-white z-[200] border md:w-[290px] rounded-md overflow-visible p-4 h-64 overflow-y-scroll"
    >
        <div class="flex justify-between mb-2">
            <input bind:value={search} type="text" class="text-xs" placeholder="Search..."/>
            <button class="pointer-feedback:text-red-700" onclick={close}>
                <Fa icon={faTimes}/>
            </button>
        </div>
        <div class="grid grid-cols-6 md:grid-cols-7">
            {#each emojis as emoji}
                <button
                        class="p-2 pointer-feedback:bg-gray-200 aspect-square inline-flex items-center justify-center openmoji text-2xl"
                        onclick={() => pick(emoji.emoji)}
                >
                    {emoji.emoji}
                </button>
            {/each}
        </div>
    </div>
{/if}

<style>
    @media (max-width: 768px) {
        .picker {
            width: 100% !important;
            left: 0 !important;
            bottom: 0 !important;
            top: auto !important;
        }
    }
</style>
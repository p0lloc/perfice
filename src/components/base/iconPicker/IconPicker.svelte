<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import {ICONS} from "@perfice/components/base/icon/icons";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {right = false}: { right?: boolean } = $props();

    const WIDTH = 290;

    let opened = $state(false);
    let x = $state(0);
    let y = $state(0);
    let resolve: (icon: string) => void;

    export function open(xPos: number, yPos: number, right: boolean = false): Promise<string> {
        opened = true;
        x = (right || xPos + WIDTH > window.innerWidth) ? xPos - WIDTH : xPos;
        y = yPos;
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
            style:left="{x}px"
            style:top="{y}px"
            style:width="{WIDTH}px"
            class="fixed w-full picker
             bg-white z-[200] border md:w-[290px] rounded-md overflow-visible p-4 h-64 overflow-y-scroll"
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
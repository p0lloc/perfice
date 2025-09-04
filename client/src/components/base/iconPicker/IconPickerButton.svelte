<script lang="ts">
    import IconPicker from "@perfice/components/base/iconPicker/IconPicker.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {EMOJIS} from "@perfice/components/base/icon/icons";
    import {isMobile} from "@perfice/util/window";

    let {icon, onChange, right = false}: { icon: string, onChange: (icon: string) => void, right?: boolean } = $props();

    let iconPicker: IconPicker;
    let button: HTMLButtonElement;

    // These are just approximations, but they should bring the user close enough to the icon
    const MOBILE_ROWS = 6;
    const DESKTOP_ROWS = 7;
    const MOBILE_CELL_HEIGHT = 54;
    const DESKTOP_CELL_HEIGHT = 48;

    function calculateScrollTop() {
        let index = EMOJIS.findIndex(e => e.emoji == icon);
        if (index == -1) index = 0;

        let rows = isMobile() ? MOBILE_ROWS : DESKTOP_ROWS;
        let itemHeight = isMobile() ? MOBILE_CELL_HEIGHT : DESKTOP_CELL_HEIGHT;
        return (index / rows) * itemHeight;
    }

    async function open() {
        let rect = button.getBoundingClientRect();
        let newIcon = await iconPicker.open(rect.left + rect.width, rect.top + rect.height, right, calculateScrollTop());
        onChange(newIcon);
    }
</script>

<div class="overflow-visible">
    <IconPicker {right} bind:this={iconPicker} icons={EMOJIS}/>
    <button bind:this={button} onclick={open}
            class="min-w-10 bg-gray-50 border-gray-300 border min-h-10 flex justify-center items-center icon-button">
        <Icon name={icon}/>
    </button>
</div>

<script lang="ts">
    import IconPicker from "@perfice/components/base/iconPicker/IconPicker.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {icon, onChange, right = false}: { icon: string, onChange: (icon: string) => void, right?: boolean } = $props();

    let iconPicker: IconPicker;
    let button: HTMLButtonElement;

    async function open() {
        let rect = button.getBoundingClientRect();
        let icon = await iconPicker.open(rect.left + rect.width, rect.top + rect.height, right);
        onChange(icon);
    }
</script>

<div class="overflow-visible">
    <IconPicker {right} bind:this={iconPicker}/>
    <button bind:this={button} onclick={open}
            class="min-w-10 bg-gray-50 border-gray-300 border min-h-10 flex justify-center items-center icon-button">
        <Icon name={icon}/>
    </button>
</div>

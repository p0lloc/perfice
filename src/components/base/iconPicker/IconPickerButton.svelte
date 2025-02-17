<script lang="ts">
    import IconPicker from "@perfice/components/base/iconPicker/IconPicker.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {icon, onChange}: { icon: string, onChange: (icon: string) => void } = $props();

    let iconPicker: IconPicker;

    async function open(){
        let icon = await iconPicker.open();
        onChange(icon);
    }
</script>

<div>
    <IconPicker bind:this={iconPicker}/>
    <button onclick={open}
            class="min-w-10 bg-gray-50 border-gray-300 border min-h-10 flex justify-center items-center icon-button">
        <Icon name={icon}/>
    </button>
</div>

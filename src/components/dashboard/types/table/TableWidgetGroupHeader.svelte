<script lang="ts">
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";

    let {name, onLog}: { name: string, onLog: () => void } = $props();
</script>

<div class="border-b w-full px-2 py-1 text-white bg-green-500 font-bold row-between">
    {name}
    <IconButton icon={faPlus} onClick={onLog} class="pointer-feedback:bg-green-600"/>
</div>

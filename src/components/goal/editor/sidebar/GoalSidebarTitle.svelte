<script lang="ts">
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

    let {title, onClose}: { title: string, onClose: () => void } = $props();
</script>

<div class="row-between">
    <h2 class="text-3xl font-bold">{title}</h2>
    <IconButton onClick={onClose} icon={faTimes} class="text-gray-500 text-xl"/>
</div>

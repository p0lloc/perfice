<script lang="ts">
    import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
    import {faCheckCircle as regularCheckCircle} from "@fortawesome/free-regular-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

    let {checked, name, onClick}: { checked: boolean, name: string, onClick: () => void } = $props();
</script>

<div class="flex gap-1 items-center [&:not(:last-child)]:border-b px-1">
    <IconButton icon={checked ? faCheckCircle : regularCheckCircle}
                {onClick}
                class="text-xl {checked ? 'text-green-500' : 'text-gray-500'}"
    />
    <span class="text-sm">{name}</span>
</div>

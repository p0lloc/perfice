<script lang="ts">
    let {value = $bindable()}: { value: string } = $props();
</script>

<input type="color" class="w-8 h-8 cursor-pointer p-0 rounded-md" bind:value>

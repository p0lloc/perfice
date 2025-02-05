<script lang="ts">
    let {value = $bindable()}: { value: string } = $props();
</script>

<input type="color" class="w-10 h-10 p-0 rounded-md" bind:value>

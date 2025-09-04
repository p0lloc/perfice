<script lang="ts">
    let {onClick}: { onClick: () => void } = $props();
</script>

<button class="flex items-center h-20 text-gray-500 font-bold gap-4 md:opacity-0 hover:opacity-100" onclick={onClick}>
    <span class="line"></span>
    <span>Add category</span>
    <span class="line"></span>
</button>

<style>
    .line {
        @apply flex-1 border-b;
    }
</style>

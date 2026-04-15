<script lang="ts">
    let {isRestDay, onToggle}: {
        isRestDay: boolean;
        onToggle: () => void;
    } = $props();
</script>

<button onclick={onToggle}
        class="flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs transition-colors {isRestDay
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}">
    <span class="w-2 h-2 rounded-full {isRestDay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}"></span>
    Rest day
</button>

<script lang="ts">
    import Fa from "svelte-fa";
    import {faDumbbell, faPlusCircle} from "@fortawesome/free-solid-svg-icons";

    let {onCreate}: { onCreate: () => void } = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <Fa icon={faDumbbell} class="text-blue-500 text-2xl"/>
    </div>
    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No sport trackables yet</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        Create a sport trackable to start logging your workouts and tracking your activity.
    </p>
    <button onclick={onCreate}
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        <Fa icon={faPlusCircle} class="text-sm"/>
        <span>Create Sport Trackable</span>
    </button>
</div>

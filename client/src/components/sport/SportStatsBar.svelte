<script lang="ts">
    import Fa from "svelte-fa";
    import {faBolt, faClock, faFire} from "@fortawesome/free-solid-svg-icons";

    let {sessions, durationFormatted, streak}: {
        sessions: number;
        durationFormatted: string;
        streak: number;
    } = $props();
</script>

<div class="grid grid-cols-3 gap-3">
    <div class="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-800 default-border">
        <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
            <Fa icon={faBolt} class="text-green-500 text-sm"/>
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-gray-200">{sessions}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">Sessions</span>
    </div>

    <div class="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-800 default-border">
        <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-1">
            <Fa icon={faClock} class="text-blue-500 text-sm"/>
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-gray-200">{durationFormatted}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">Duration</span>
    </div>

    <div class="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-gray-800 default-border">
        <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-1">
            <Fa icon={faFire} class="text-orange-500 text-sm"/>
        </div>
        <span class="text-lg font-bold text-gray-800 dark:text-gray-200">{streak}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">Day Streak</span>
    </div>
</div>

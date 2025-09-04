<script lang="ts">
    import type {DashboardWelcomeWidgetSettings} from "@perfice/model/dashboard/widgets/welcome";
    import {faSun} from "@fortawesome/free-solid-svg-icons";
    import {fetchRandomQuote, getTimeOfDayText} from "@perfice/stores/dashboard/widget/welcome";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {settings}: {
        settings: DashboardWelcomeWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();
</script>

<div class="p-4 md:p-6 w-full h-full box-border bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-md text-white flex justify-between">
    <div class="md:w-1/2"><h2 class="text-3xl font-bold">Good {getTimeOfDayText()}!</h2>
        <p class="italic">{fetchRandomQuote()}</p></div>
    <div class="flex self-end">
        <Fa icon={faSun} class="text-7xl"/>
    </div>
</div>

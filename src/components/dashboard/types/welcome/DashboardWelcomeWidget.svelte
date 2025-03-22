<script lang="ts">
    import type {DashboardWelcomeWidgetSettings} from "@perfice/model/dashboard/widgets/welcome";
    import Fa from "svelte-fa";
    import {faSun} from "@fortawesome/free-solid-svg-icons";

    let {settings}: {
        settings: DashboardWelcomeWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();
</script>

<div class="p-4 md:p-6 w-full h-full box-border bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-md text-white flex flex-col justify-between">
    <div><h2 class="text-3xl font-bold">Good morning!</h2>
        <p>Today is going to be a great day!</p></div>
    <div class="flex justify-end">
        <Fa icon={faSun} class="text-7xl"/>
    </div>
</div>

<script lang="ts">
    import type {DashboardMetricWidgetSettings} from "@perfice/model/dashboard/widgets/metric";
    import {faBatteryFull} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {settings}: {
        settings: DashboardMetricWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();
</script>

<div class="w-full h-full bg-white p-4 flex gap-3 items-center border rounded-xl">
    <div>
        <Icon name={settings.icon} class="text-3xl w-8"/>
    </div>
    <div><h2 class="text-xl text-gray-600 font-bold">Sleep</h2>
        <p class="text-lg">7h 30min</p></div>
</div>
<script lang="ts">
    import type {DashboardInsightsWidgetSettings} from "@perfice/model/dashboard/widgets/insights";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {faHatWizard} from "@fortawesome/free-solid-svg-icons";
    import {TIME_SCOPE_LABELS} from "@perfice/model/variable/ui";
    import QuestionLabel from "@perfice/components/analytics/QuestionLabel.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {insightsWidget} from "@perfice/stores";

    let {widgetId, dependencies, settings}: {
        settings: DashboardInsightsWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void,
        widgetId: string
    } = $props();

    let result = $derived(insightsWidget(settings, $dashboardDate));
</script>

<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col ">
    {#await $result}
        Loading...
    {:then value}
        <div class="border-b basic self-stretch p-2 font-bold text-gray-600 row-between">
            <div class="row-gap">
                <Fa class="text-green-500" icon={faHatWizard}/>
                <span>{TIME_SCOPE_LABELS[settings.timeScope]}</span>
            </div>
        </div>
        <div class="flex flex-col overflow-y-scroll scrollbar-hide w-full">
            {#each value.insights as insight}
                <div class="text-sm border-b p-2 flex justify-between gap-2">
                    <span class="flex flex-wrap gap-1 break-words items-center">Your
                        <QuestionLabel message={`${insight.formName} > ${insight.questionName}`}>
                            <Icon name={insight.icon} class="text-sm"/>
                        </QuestionLabel>
                        {#each insight.text.text.split(" ") as word}
                            <span>{word}</span>
                        {/each}
                    </span>
                    <span class={insight.insight.error > 1 ? "text-green-600" : "text-red-500"}>{insight.text.percentage}</span>
                </div>
            {:else}
                <span class="p-4">There are no insights yet, try adding more data.</span>
            {/each}
        </div>
    {/await}
</div>

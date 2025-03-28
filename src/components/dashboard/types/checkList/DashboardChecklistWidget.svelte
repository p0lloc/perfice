<script lang="ts">
    import {
        ChecklistConditionType,
        type DashboardChecklistWidgetSettings
    } from "@perfice/model/dashboard/widgets/checklist";
    import {checklistWidget, forms, journal, tags, weekStart} from "@perfice/app";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import type {ChecklistWidgetConditionResult} from "@perfice/stores/dashboard/widget/checklist";
    import {dateWithCurrentTime} from "@perfice/util/time/simple.js";
    import {convertValueToDisplay} from "@perfice/model/form/validation";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {pDisplay, type PrimitiveValue, pString} from "@perfice/model/primitive/primitive";
    import ChecklistEntry from "@perfice/components/dashboard/types/checkList/ChecklistEntry.svelte";

    let {settings, dependencies}: {
        settings: DashboardChecklistWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    // The cache key is based on the settings, since we update the variable whenever form/question changes
    let result = $derived(checklistWidget(dependencies, settings, $dashboardDate,
        $weekStart, settings.conditions.map(z => z.id).join(":")));

    async function check(result: ChecklistWidgetConditionResult) {
        let condition = settings.conditions.find(c => c.id == result.id);
        if (condition == null) return;

        let entryId = result.entryId;
        switch (condition.value.type) {
            case ChecklistConditionType.FORM:
                if (entryId == null) {
                    let form = await forms.getFormById(condition.value.value.formId);
                    if (form == null) return;

                    // Convert all answers to display values
                    let answers: Record<string, PrimitiveValue> = Object.fromEntries(
                        Object.entries(condition.value.value.answers)
                            .map(([k, v]) => {
                                let question = form.questions.find(q => q.id == k);
                                if (question == null) return [k, pDisplay(pString(""), pString(""))];

                                let dataTypeDef = questionDataTypeRegistry.getDefinition(question.dataType)!;
                                let displayTypeDef = questionDisplayTypeRegistry.getFieldByType(question.displayType)!;
                                return [k, convertValueToDisplay(v, question, dataTypeDef, displayTypeDef)];
                            }));

                    await journal.logEntry(form, answers,
                        form.format, dateWithCurrentTime($dashboardDate).getTime());
                } else {
                    await journal.deleteEntryById(entryId);
                }

                break;
            case ChecklistConditionType.TAG: {
                if (entryId == null) {
                    await tags.logTag(condition.value.value.tagId, $dashboardDate);
                } else {
                    await tags.unlogTagEntry(entryId);
                }
                break;
            }
        }
    }
</script>

<div class="bg-white rounded-xl border basic w-full h-full items-start flex flex-col ">
    {#await $result}
        <span class="p-2">
            Please select a form
        </span>
    {:then value}
        <div class="border-b basic self-stretch p-2 font-bold text-gray-600 row-between">
            <div class="row-gap">
                <Fa icon={faCheck} class="text-green-500"/>
                <span>Checklist</span>
            </div>
        </div>
        <div class="overflow-y-scroll scrollbar-hide w-full">
            {#each value.conditions as condition}
                <ChecklistEntry name={condition.name}
                                checked={condition.entryId != null} onClick={() => check(condition)}/>
            {/each}
        </div>
    {/await}
</div>

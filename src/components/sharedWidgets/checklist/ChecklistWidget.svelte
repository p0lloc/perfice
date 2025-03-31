<script lang="ts">
    import {checklistWidget, forms, weekStart} from "@perfice/app";
    import {faCheck} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ChecklistEntry from "@perfice/components/dashboard/types/checkList/ChecklistEntry.svelte";
    import type {
        ChecklistData,
        ChecklistWidgetConditionResult
    } from "@perfice/stores/sharedWidgets/checklist/checklist";
    import {
        ChecklistConditionType,
        type ChecklistWidgetSettings
    } from "@perfice/model/sharedWidgets/checklist/checklist";

    let {settings, dependencies, date, onCheck, onUncheck, extraData = []}: {
        settings: ChecklistWidgetSettings,
        dependencies: Record<string, string>,
        date: Date,

        onCheck: (data: ChecklistData) => void,
        onUncheck: (type: ChecklistConditionType, entryId: string) => void,

        extraData?: ChecklistData[]
    } = $props();

    // The cache key is based on the settings, since we update the variable whenever form/question changes
    let result = $derived(checklistWidget(dependencies, settings, date,
        $weekStart, settings.conditions.map(z => z.id).join(":"), extraData));

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

                    onCheck({
                        type: ChecklistConditionType.FORM,
                        data: {
                            entryId: crypto.randomUUID(),
                            formId: condition.value.value.formId,
                            answers: condition.value.value.answers
                        }
                    });
                } else {
                    onUncheck(condition.value.type, entryId);
                }

                break;
            case ChecklistConditionType.TAG: {
                if (entryId == null) {
                    onCheck({
                        type: ChecklistConditionType.TAG,
                        data: {
                            entryId: crypto.randomUUID(),
                            tagId: condition.value.value.tagId
                        }
                    });
                } else {
                    onUncheck(condition.value.type, entryId);
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

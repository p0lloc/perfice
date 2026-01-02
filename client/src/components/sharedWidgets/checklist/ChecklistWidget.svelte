<script lang="ts">
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ChecklistEntry from "@perfice/components/dashboard/types/checkList/ChecklistEntry.svelte";
    import type {
        ChecklistData,
        ChecklistWidgetConditionResult,
    } from "@perfice/stores/sharedWidgets/checklist/checklist";
    import {
        ChecklistConditionType,
        type ChecklistWidgetSettings,
    } from "@perfice/model/sharedWidgets/checklist/checklist";
    import { checklistWidget, forms, weekStart } from "@perfice/stores";
    import DashboardWidgetBase from "@perfice/components/dashboard/DashboardWidgetBase.svelte";

    let {
        settings,
        dependencies,
        date,
        onCheck,
        onUncheck,
        extraData = [],
    }: {
        settings: ChecklistWidgetSettings;
        dependencies: Record<string, string>;
        date: Date;

        onCheck: (data: ChecklistData) => void;
        onUncheck: (data: ChecklistData) => void;

        extraData?: ChecklistData[];
    } = $props();

    // The cache key is based on the settings, since we update the variable whenever form/question changes
    let result = $derived(
        checklistWidget(
            dependencies,
            settings,
            date,
            $weekStart,
            settings.conditions.map((z) => z.id).join(":"),
            extraData,
        ),
    );

    async function check(result: ChecklistWidgetConditionResult) {
        let condition = settings.conditions.find((c) => c.id == result.id);
        if (condition == null) return;

        let data = result.data;
        if (data != null) {
            if (data.unchecked) {
                onCheck({ ...data, unchecked: false });
            } else {
                onUncheck({ ...data, unchecked: true });
            }
            return;
        }

        switch (condition.value.type) {
            case ChecklistConditionType.FORM:
                let form = await forms.getFormById(
                    condition.value.value.formId,
                );
                if (form == null) return;

                let newId = crypto.randomUUID();
                onCheck({
                    id: newId,
                    type: ChecklistConditionType.FORM,
                    unchecked: false,
                    data: {
                        entryId: newId,
                        formId: condition.value.value.formId,
                        answers: condition.value.value.answers,
                    },
                });
                break;
            case ChecklistConditionType.TAG: {
                let newId = crypto.randomUUID();
                onCheck({
                    id: newId,
                    type: ChecklistConditionType.TAG,
                    unchecked: false,
                    data: {
                        entryId: newId,
                        tagId: condition.value.value.tagId,
                    },
                });
                break;
            }
        }
    }
</script>

{#await $result}
    <DashboardWidgetBase>
        <span class="p-2"> Please select a form </span>
    </DashboardWidgetBase>
{:then value}
    <DashboardWidgetBase title="Checklist" icon={faCheck}>
        <div class="overflow-y-scroll scrollbar-hide w-full">
            {#each value.conditions as result}
                <ChecklistEntry
                    name={result.name}
                    checked={result.data != null && !result.data.unchecked}
                    onClick={() => check(result)}
                />
            {/each}
        </div>
    </DashboardWidgetBase>
{/await}

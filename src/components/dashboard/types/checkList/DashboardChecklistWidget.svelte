<script lang="ts">
    import {type DashboardChecklistWidgetSettings} from "@perfice/model/dashboard/widgets/checklist";
    import {dashboardDate} from "@perfice/stores/dashboard/dashboard";
    import ChecklistWidget from "@perfice/components/sharedWidgets/checklist/ChecklistWidget.svelte";
    import type {ChecklistData} from "@perfice/stores/sharedWidgets/checklist/checklist";
    import {ChecklistConditionType} from "@perfice/model/sharedWidgets/checklist/checklist";
    import {dateWithCurrentTime} from "@perfice/util/time/simple";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {convertAnswersToDisplay} from "@perfice/model/form/validation";
    import {forms, journal, tags} from "@perfice/stores";

    let {settings, dependencies, openFormModal}: {
        settings: DashboardChecklistWidgetSettings,
        dependencies: Record<string, string>,
        openFormModal: (formId: string) => void
    } = $props();

    async function onCheck(data: ChecklistData) {
        switch (data.type) {
            case ChecklistConditionType.FORM:
                let form = await forms.getFormById(data.data.formId);
                if (form == null) return;

                let answers: Record<string, PrimitiveValue> = convertAnswersToDisplay(data.data.answers, form.questions);
                await journal.logEntry(form, answers,
                    form.format, dateWithCurrentTime($dashboardDate).getTime());

                break;
            case ChecklistConditionType.TAG:
                await tags.logTag(data.data.tagId, $dashboardDate);
                break;
        }
    }

    async function onUncheck(data: ChecklistData) {
        switch (data.type) {
            case ChecklistConditionType.FORM:
                await journal.deleteEntryById(data.id);
                break;
            case ChecklistConditionType.TAG:
                await tags.unlogTagEntry(data.id);
                break;
        }
    }
</script>

<ChecklistWidget date={$dashboardDate} {settings} {dependencies} onCheck={onCheck}
                 onUncheck={onUncheck}/>
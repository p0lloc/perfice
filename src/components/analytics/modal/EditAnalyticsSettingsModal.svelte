<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";

    let {onSave}: { onSave: (settings: AnalyticsSettings) => void } = $props();

    let settings = $state<AnalyticsSettings>({} as AnalyticsSettings);
    let questions = $state<FormQuestion[]>([]);

    let modal: Modal;

    export function open(editSettings: AnalyticsSettings, editQuestions: FormQuestion[]) {
        // Default to using mean value not set
        editQuestions.forEach(q => {
            if (editSettings.useMeanValue[q.id] == null) {
                editSettings.useMeanValue[q.id] = true;
            }
        });

        settings = editSettings;
        questions = editQuestions;

        modal.open();
    }

    function onConfirm() {
        onSave($state.snapshot(settings));
        modal.close();
    }

    function onQuestionChange(questionId: string) {
        settings.questionId = questionId;
    }

    let questionDropdownItems = $derived(questions.map(q => {
        return {
            name: q.name,
            value: q.id,
        }
    }));
</script>

<Modal title="Edit analytics settings" size={ModalSize.MEDIUM}
       type={ModalType.CONFIRM_CANCEL} confirmText="Save" bind:this={modal} onConfirm={onConfirm}>
    <div class="row-between">
        <IconLabel icon={faQuestionCircle} title="Question"/>
        <DropdownButton value={settings.questionId} items={questionDropdownItems} onChange={onQuestionChange}/>
    </div>
    <h2 class="text-xl text-gray-500 mb-2 mt-4 font-bold">Use average values</h2>
    <div class="flex flex-col gap-2">
        {#each questions as question}
            <div class="row-between">
                <p>{question.name}</p>
                <input type="checkbox" bind:checked={settings.useMeanValue[question.id]}>
            </div>
        {/each}
    </div>
    <div class="mt-4 row-between">
        <div class="flex flex-col mb-2"><h2 class="text-xl text-gray-500 font-bold">Interpolate values</h2>
            <p class="text-xs">Uses the last available value to interpolate values for the next day</p></div>
        <input type="checkbox" bind:checked={settings.interpolate}>
    </div>
</Modal>
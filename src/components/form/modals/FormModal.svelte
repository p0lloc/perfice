<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import type {Form, FormQuestion} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import FormTemplateButton from "@perfice/components/form/modals/FormTemplateButton.svelte";
    import type {FormTemplate} from "@perfice/model/form/form.js";
    import {extractAnswerValuesFromDisplay} from "@perfice/services/variable/types/list";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCheck, faTrash} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {forms, journal} from "@perfice/stores";
    import {getDefaultFormAnswers} from "@perfice/model/form/data";
    import SveltyPicker from "svelty-picker";
    import {formatDateHHMM} from "@perfice/util/time/format";
    import {parseHhMm} from "@perfice/util/time/simple";

    let {largeLogButton = true, onDelete}: {
        largeLogButton?: boolean,
        onDelete?: (entry: JournalEntry) => void
    } = $props();

    let form: Form = $state({} as Form);
    let questions: FormQuestion[] = $state([]);
    let date: Date = $state(new Date());
    let logTime: string = $state("");
    let editEntry: JournalEntry | undefined;
    let answers: Record<string, PrimitiveValue> = $state({});
    let templates: FormTemplate[] = $state([]);

    let format: TextOrDynamic[] = $state([]);

    let currentTemplateName: string | null = $state(null);
    let editingTemplate: FormTemplate | null = $state(null);

    let modal: Modal;
    let embed: FormEmbed;

    export function open(logForm: Form, formQuestions: FormQuestion[], displayFormat: TextOrDynamic[], logDate: Date,
                         availableTemplates: FormTemplate[], existingAnswers?: Record<string, PrimitiveValue>, entry?: JournalEntry) {

        form = logForm;
        date = logDate;
        logTime = formatDateHHMM(logDate);
        format = displayFormat;
        questions = formQuestions;
        editEntry = entry;
        templates = availableTemplates;
        answers = existingAnswers ?? getDefaultFormAnswers(form.questions);
        currentTemplateName = null;
        modal.open();

        setTimeout(() => embed.focus()); // Give embed time to mount
    }

    function close() {
        modal.close();
    }

    function createOrUpdateTemplate(name: string, answers: Record<string, PrimitiveValue>) {
        let extractedValues = extractAnswerValuesFromDisplay(answers);

        if (editingTemplate != null) {
            forms.updateFormTemplate($state.snapshot(editingTemplate), name, extractedValues);
        } else {
            forms.createFormTemplate(form.id, name, extractedValues);
        }
    }

    function confirm() {
        let answers = embed.validateAndGetAnswers();
        if (answers == null) return; // If there are validation errors, don't save

        let parsedTime = parseHhMm(logTime);
        if (parsedTime == null) return;

        let [hours, minutes] = parsedTime;
        date.setHours(hours);
        date.setMinutes(minutes);

        if (editEntry != null) {
            journal.updateEntry({
                ...editEntry,
                answers,
                timestamp: date.getTime()
            }, format);
        } else {
            journal.logEntry(form, answers, format, date.getTime());
        }

        if (currentTemplateName != null) {
            createOrUpdateTemplate($state.snapshot(currentTemplateName), answers);
        }

        close();
    }

    function onNewTemplate() {
        currentTemplateName = "";
    }

    function onTemplateSelected(template: FormTemplate) {
        currentTemplateName = null
        answers = template.answers;
        embed.invalidateValues();
    }

    function onEditTemplate(template: FormTemplate) {
        currentTemplateName = template.name;
        editingTemplate = template;
        answers = template.answers;
        embed.invalidateValues();
    }

    function onDeleteClicked() {
        if (editEntry == null) return;
        close();
        onDelete?.(editEntry);
    }

    function onLogTimeChanged(e: string | string[] | null) {
        if (typeof e != "string") return;

        logTime = e;
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title={form.name} bind:this={modal} onConfirm={confirm} leftTitle={true}>
    {#snippet actions()}
        <SveltyPicker
                inputClasses="w-16 text-center"
                mode={"time"}
                format="hh:ii"
                value={logTime}
                onChange={onLogTimeChanged}
        />
        {#if editEntry != null}
            <IconButton icon={faTrash} onClick={onDeleteClicked}/>
        {:else}
            <FormTemplateButton {templates} onNew={onNewTemplate}
                                onTemplateSelected={onTemplateSelected} onEditTemplate={onEditTemplate}/>
        {/if}
    {/snippet}

    {#if currentTemplateName != null}
        <input type="text" class="w-full border mt-2" bind:value={currentTemplateName} placeholder="Template name"/>
        {#if editingTemplate == null}
            <p class="text-xs mt-2">A new template will be created with the provided answers.</p>
        {/if}
        <hr class="my-4"/>
    {/if}

    <div class="overflow-y-scroll scrollbar-hide md:pb-0 pb-20">
        <FormEmbed bind:this={embed} questions={questions} answers={answers}/>
    </div>

    {#if largeLogButton}
        <button onclick={confirm} class="md:hidden fixed bottom-0 w-screen h-20 bg-green-500 flex-center
    pointer-feedback:bg-green-600 text-white left-0">

            <Fa icon={faCheck} size="2.0x"/>
        </button>
    {/if}
</Modal>

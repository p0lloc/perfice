<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import type {Form, FormQuestion} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import {pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import {forms, journal} from "@perfice/main";
    import FormTemplateButton from "@perfice/components/form/modals/FormTemplateButton.svelte";
    import type {FormTemplate} from "@perfice/model/form/form.js";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";

    let form: Form = $state({} as Form);
    let questions: FormQuestion[] = $state([]);
    let date: Date = $state(new Date());
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
        format = displayFormat;
        questions = formQuestions;
        editEntry = entry;
        templates = availableTemplates;
        answers = existingAnswers ?? getDefaultAnswers(form.questions);
        currentTemplateName = null;
        modal.open();
    }

    function close() {
        modal.close();
    }

    function createOrUpdateTemplate(name: string, answers: Record<string, PrimitiveValue>){
        let extractedValues = Object.fromEntries(
            Object.entries(answers).map(([k, v]) => [k, extractValueFromDisplay(v)]));

        if(editingTemplate != null) {
            forms.updateFormTemplate($state.snapshot(editingTemplate), name, extractedValues);
        } else {
            forms.createFormTemplate(form.id, name, extractedValues);
        }
    }

    function confirm() {
        let answers = embed.validateAndGetAnswers();
        if (answers == null) return; // If there are validation errors, don't save

        if (editEntry != null) {
            journal.updateEntry({
                ...editEntry,
                answers
            }, format);
        } else {
            journal.logEntry(form, answers, format, date.getTime());
        }

        if (currentTemplateName != null) {
            createOrUpdateTemplate($state.snapshot(currentTemplateName), answers);
        }

        close();
    }

    function getDefaultAnswers(questions: FormQuestion[]): Record<string, PrimitiveValue> {
        let answers: Record<string, PrimitiveValue> = {};
        for (let question of questions) {
            let displayDef = questionDisplayTypeRegistry.getFieldByType(question.displayType);
            if (displayDef == null) continue;

            let value: any;
            if (displayDef.hasMultiple(question.displaySettings)) {
                value = pList([]);
            } else {
                let definition = questionDataTypeRegistry.getDefinition(question.dataType);
                if (definition == null) continue;

                value = definition.deserialize(definition.getDefaultValue(question.dataSettings));
            }

            answers[question.id] = value;
        }

        return answers;
    }

    function onNewTemplate() {
        currentTemplateName = "";
    }

    function onTemplateSelected(template: FormTemplate) {
        currentTemplateName = null
        answers = template.answers;
        console.log(answers);
        embed.invalidateValues();
    }

    function onEditTemplate(template: FormTemplate) {
        currentTemplateName = template.name;
        editingTemplate = template;
        answers = template.answers;
        embed.invalidateValues();
    }
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title={form.name} bind:this={modal} onConfirm={confirm}>
    {#if currentTemplateName != null}
        <input type="text" class="w-full border mt-2" bind:value={currentTemplateName} placeholder="Template name"/>
        {#if editingTemplate == null}
            <p class="text-xs mt-2">A new template will be created with the provided answers.</p>
        {/if}
        <hr class="my-4"/>
    {/if}
    <FormEmbed bind:this={embed} questions={questions} answers={answers}/>
    {#snippet actions()}
        <FormTemplateButton {templates} onNew={onNewTemplate}
                            onTemplateSelected={onTemplateSelected} onEditTemplate={onEditTemplate}/>
    {/snippet}
</Modal>

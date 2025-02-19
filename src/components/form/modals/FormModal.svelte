<script lang="ts">
    import {ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import type {Form, FormQuestion} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import type {JournalEntry} from "@perfice/model/journal/journal";
    import {pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import {journal} from "@perfice/main";

    let form: Form = $state({} as Form);
    let questions: FormQuestion[] = $state([]);
    let date: Date = $state(new Date());
    let editEntry: JournalEntry | undefined;
    let answers: Record<string, PrimitiveValue> = $state({});

    let modal: Modal;
    let embed: FormEmbed;

    export function open(logForm: Form, formQuestions: FormQuestion[], logDate: Date,
                         existingAnswers?: Record<string, PrimitiveValue>, entry?: JournalEntry) {

        form = logForm;
        date = logDate;
        questions = formQuestions;
        editEntry = entry;
        answers = existingAnswers ?? getDefaultAnswers(form.questions);
        modal.open();
    }

    function close() {
        modal.close();
    }

    function confirm() {
        let answers = embed.validateAndGetAnswers();
        if (answers == null) return; // If there are validation errors, don't save

        if (editEntry != null) {
            journal.updateEntry({
                ...editEntry,
                answers
            });
        } else {
            /*if (false) {
                for (let j = 0; j < 20; j++) {
                    for (let i = 0; i < 5; i++) {
                        journal.logEntry(form, answers, date.getTime() - (j * 1000 * 60 * 60 * 24));
                    }
                }*/

            journal.logEntry(form, answers, date.getTime());
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
</script>

<Modal type={ModalType.CONFIRM_CANCEL} title={form.name} bind:this={modal} onConfirm={confirm}>
    <FormEmbed bind:this={embed} questions={questions} answers={answers}/>
</Modal>

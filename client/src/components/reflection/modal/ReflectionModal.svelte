<script lang="ts">

    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {
        generateAnswerStates,
        type Reflection,
        type ReflectionWidgetAnswerState
    } from "@perfice/model/reflection/reflection";
    import ReflectionPageButton from "@perfice/components/reflection/modal/ReflectionPageButton.svelte";
    import ReflectionPageRenderer from "@perfice/components/reflection/modal/ReflectionPageRenderer.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {Form} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {forms, reflections} from "@perfice/stores";
    import {getDefaultFormAnswers} from "@perfice/model/form/data";
    import ObjectDatePicker from "@perfice/components/base/datePicker/ObjectDatePicker.svelte";

    let modal: Modal;
    let reflection = $state<Reflection>({} as Reflection);
    let answerStates: Record<string, ReflectionWidgetAnswerState> = $state({});
    let currentPageNumber = $state(0);

    let pageRenderer: ReflectionPageRenderer;

    let currentPage = $derived(reflection.pages[currentPageNumber]);

    let nestedFormEmbed: FormEmbed;
    let nestedForm = $state<Form | null>(null);
    let nestedFormAnswers = $state<Record<string, PrimitiveValue>>({});
    let nestedFormCallback = $state<(answers: Record<string, PrimitiveValue>, timestamp: number) => void>(() => {
    });

    let date = $state(new Date());

    function validate(): boolean {
        if (pageRenderer == null) return false;
        return pageRenderer.validate();
    }

    function previous() {
        if (!validate()) return;
        currentPageNumber--;
    }

    function next() {
        if (!validate()) return;

        if (currentPageNumber == reflection.pages.length - 1) {
            reflections.logReflection($state.snapshot(reflection), $state.snapshot(answerStates), date);
            modal.close();
        } else {
            currentPageNumber++;
        }
    }

    function onStateChange(id: string, state: ReflectionWidgetAnswerState) {
        answerStates[id] = state;
    }

    async function openNestedForm(formId: string,
                                  onLog: (answers: Record<string, PrimitiveValue>, timestamp: number) => void,
                                  timeScope: SimpleTimeScopeType,
                                  answers?: Record<string, PrimitiveValue>) {
        let formById = await forms.getFormById(formId);
        if (formById == null) return;

        nestedForm = formById;
        nestedFormAnswers = {...getDefaultFormAnswers(formById.questions), ...answers};
        nestedFormCallback = onLog;
    }

    function logNestedForm() {
        let answers = nestedFormEmbed.validateAndGetAnswers();
        if (answers == null) return;

        nestedFormCallback(answers, date.getTime());
        cancelNestedForm();
    }

    function cancelNestedForm() {
        nestedForm = null;
    }

    function onDateChanged(newDate: Date) {
        date = newDate;
    }

    export function open(activeReflection: Reflection) {
        reflection = activeReflection;
        currentPageNumber = 0;
        date = new Date();
        nestedForm = null;
        answerStates = Object.fromEntries(reflection.pages.flatMap(p => Object.entries(generateAnswerStates(p.widgets))));
        modal.open();
    }
</script>

<Modal size={ModalSize.LARGE} type={ModalType.NONE} title={reflection.name} bind:this={modal} onEnter={next}>
    {#snippet actions()}
        <ObjectDatePicker
                inputClasses="w-16 text-center"
                value={date}
                displayFormat="hh:ii"
                onChange={onDateChanged}
        />
    {/snippet}

    {#if currentPage != null}
        {#if nestedForm != null}
            <div class="pb-20 md:pb-0">
                <FormEmbed bind:this={nestedFormEmbed} questions={nestedForm.questions} answers={nestedFormAnswers}/>
            </div>
        {:else}
            <ReflectionPageRenderer onStateChange={onStateChange} page={currentPage}
                                    states={answerStates}
                                    bind:this={pageRenderer} {openNestedForm}/>
        {/if}
    {:else}
        This reflection has no pages.
    {/if}

    {#snippet customFooter()}
        <div class="w-full border-t justify-center items-center gap-2 py-2 fixed md:static bottom-0 flex bg-white dark:bg-gray-900 dark-border">
            {#if nestedForm != null}
                <Button onClick={logNestedForm}>Log</Button>
                <Button color={ButtonColor.RED} onClick={cancelNestedForm}>Cancel</Button>
            {:else}
                <div class="w-16 flex-center">
                    <ReflectionPageButton left={true} onClick={previous}
                                          end={currentPageNumber === 0}/>
                </div>
                <div class="bg-gray-100 rounded-xl w-48">
                    <div class="bg-green-500 w-[60%] p-2 rounded-xl"
                         style:width={((currentPageNumber + 1) / (Math.max(reflection.pages.length, 1) ?? 1)) * 100 + "%"}>

                    </div>
                </div>
                <div class="w-16 flex-center">
                    <ReflectionPageButton left={false} onClick={next}
                                          end={currentPageNumber === reflection.pages.length - 1}/>
                </div>
            {/if}
        </div>
    {/snippet}
</Modal>
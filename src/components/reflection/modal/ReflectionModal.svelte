<script lang="ts">

    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {
        generateAnswerStates,
        type Reflection,
        type ReflectionWidgetAnswerState
    } from "@perfice/model/reflection/reflection";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import ReflectionPageButton from "@perfice/components/reflection/modal/ReflectionPageButton.svelte";
    import ReflectionPageRenderer from "@perfice/components/reflection/modal/ReflectionPageRenderer.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import type {Form} from "@perfice/model/form/form";
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import DatePicker from "@perfice/components/base/datePicker/DatePicker.svelte";
    import {SimpleTimeScopeType} from "@perfice/model/variable/time/time";
    import {faCalendar} from "@fortawesome/free-solid-svg-icons";
    import {formatDateYYYYMMDDHHMMSS} from "@perfice/util/time/format";
    import {forms, reflections} from "@perfice/stores";
    import {getDefaultFormAnswers} from "@perfice/model/form/data";

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
    let nestedFormTimeScope = $state(SimpleTimeScopeType.DAILY);

    let date = $state(new Date());

    function validate(): boolean {
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

        date = new Date();
        nestedForm = formById;
        nestedFormAnswers = {...getDefaultFormAnswers(formById.questions), ...answers};
        nestedFormCallback = onLog;
        nestedFormTimeScope = timeScope;
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

    export function open(activeReflection: Reflection) {
        reflection = activeReflection;
        currentPageNumber = 0;
        nestedForm = null;
        answerStates = Object.fromEntries(reflection.pages.flatMap(p => Object.entries(generateAnswerStates(p.widgets))));
        modal.open();
    }
</script>

<Modal size={ModalSize.LARGE} type={ModalType.NONE} title={reflection.name} bind:this={modal}
       onConfirm={confirm}>

    {#if nestedForm != null}
        {#if nestedFormTimeScope !== SimpleTimeScopeType.DAILY}
            <div class="flex justify-end mb-4 gap-2 items-center text-gray-500">
                <Fa icon={faCalendar}/>
                <DatePicker value={formatDateYYYYMMDDHHMMSS(date)} time={true}
                            onChange={(v) => date = new Date(v)} disabled={false}/>
            </div>
        {/if}
        <div class="pb-20 md:pb-0">
            <FormEmbed bind:this={nestedFormEmbed} questions={nestedForm.questions} answers={nestedFormAnswers}/>
        </div>
    {:else}
        <ReflectionPageRenderer onStateChange={onStateChange} page={currentPage}
                                states={answerStates}
                                bind:this={pageRenderer} {openNestedForm}/>
    {/if}

    {#snippet customFooter()}
        <div class="w-full border-t justify-center items-center gap-2 py-2 fixed md:static bottom-0 flex bg-white">
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
                         style:width={((currentPageNumber + 1) / reflection.pages.length) * 100 + "%"}>

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
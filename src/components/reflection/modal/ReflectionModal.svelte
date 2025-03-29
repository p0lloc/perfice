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
    import {reflections} from "@perfice/app";

    let modal: Modal;
    let reflection = $state<Reflection>({} as Reflection);
    let answerStates: Record<string, ReflectionWidgetAnswerState> = $state({});
    let currentPageNumber = $state(0);

    let pageRenderer: ReflectionPageRenderer;

    let currentPage = $derived(reflection.pages[currentPageNumber]);

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
            reflections.logReflection($state.snapshot(reflection), $state.snapshot(answerStates));
            modal.close();
        } else {
            currentPageNumber++;
        }
    }

    function onStateChange(id: string, state: ReflectionWidgetAnswerState) {
        answerStates[id] = state;
    }

    export function open(activeReflection: Reflection) {
        reflection = activeReflection;
        answerStates = Object.fromEntries(reflection.pages.flatMap(p => Object.entries(generateAnswerStates(p.widgets))));
        modal.open();
    }
</script>

<Modal size={ModalSize.LARGE} type={ModalType.NONE} title={reflection.name} bind:this={modal}
       onConfirm={confirm}>

    <ReflectionPageRenderer onStateChange={onStateChange} page={currentPage} states={answerStates}
                            bind:this={pageRenderer}/>

    {#snippet customFooter()}
        <div class="w-full border-t justify-center items-center gap-2 py-2 fixed md:static bottom-0 flex">
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
        </div>
    {/snippet}
</Modal>
<script lang="ts">
    import {forms} from "@perfice/main";
    import {type Form, type FormQuestion, FormQuestionDisplayType} from "@perfice/model/form/form";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import FormFieldEdit from "@perfice/components/form/editor/field/FormFieldEdit.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
    import {QUESTION_DISPLAY_TYPES} from "@perfice/model/form/ui";
    import FormEditorSidebar from "@perfice/components/form/editor/sidebar/FormEditorSidebar.svelte";

    let {params}: { params: Record<string, string> } = $props();
    let form = $state<Form | undefined>(undefined);

    let currentQuestion = $state<FormQuestion | null>(null);
    let contextMenu = $state<ContextMenu | undefined>();

    $effect(() => {
        loadForm();
    });

    function createQuestion(type: FormQuestionDisplayType) {
    }

    function editQuestion(q: FormQuestion) {
        currentQuestion = q;
    }


    function deleteQuestion(q: FormQuestion) {
        currentQuestion = q;
    }

    function save() {
    }

    function back() {
    }

    async function loadForm() {
        let formId = params.formId;
        if (formId == undefined) return;

        form = await forms.getFormById(formId);
    }
</script>

{#if form !== undefined}
    <div class="flex justify-between">
        <div class="p-2 flex-1 flex">
            <div class="mx-auto w-full md:w-1/2 mt-8">
                <h2 class="text-3xl font-bold">{form.name}</h2>
                <label for="first_name" class=" mb-2 label">Format</label>
                <h2 class="text-2xl font-bold">Questions</h2>
                <div class="flex flex-col gap-4">
                    {#each form.questions as question(question.id)}
                        <FormFieldEdit {question} selected={currentQuestion?.id === question.id}
                                       onClick={() => editQuestion(question)}
                                       onDelete={() => deleteQuestion(question)}/>
                    {/each}
                    <button class="border-2 border-dashed h-16 p-4 w-full text-gray-600 flex justify-center items-center"
                            onclick={(e) => contextMenu?.openFromClick(e)}>
                        <Fa icon={faPlusCircle} class="pointer-events-none"/>
                    </button>
                </div>

                <div class="hidden md:block mt-4">
                    <Button onClick={save}>
                        Save
                    </Button>
                    <Button color={ButtonColor.RED} onClick={back}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>

        <FormEditorSidebar onClose={() => currentQuestion = null} bind:currentQuestion/>
        <ContextMenu bind:this={contextMenu}>
            <ContextMenuButtons buttons={QUESTION_DISPLAY_TYPES.map((t) => {
                return {
                    name: t.name,
                    icon: t.icon,
                    action: () => createQuestion(t.type)
                }
            })}/>
        </ContextMenu>
    </div>
{:else}
    <h1>Form not found</h1>
{/if}


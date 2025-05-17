<script lang="ts">
    import {
        type Form,
        type FormQuestion,
        FormQuestionDataType,
        FormQuestionDisplayType,
    } from "@perfice/model/form/form";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import ContextMenu from "@perfice/components/base/contextMenu/ContextMenu.svelte";
    import ContextMenuButtons from "@perfice/components/base/contextMenu/ContextMenuButtons.svelte";
    import FormFieldEdit from "@perfice/components/form/editor/field/FormFieldEdit.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {
        faArrowLeft,
        faCheck,
        faFont,
        faHeading,
        faPlusCircle,
        faQuestionCircle,
    } from "@fortawesome/free-solid-svg-icons";
    import {NEW_FORM_ROUTE} from "@perfice/model/form/ui";
    import FormEditorSidebar from "@perfice/components/form/editor/sidebar/FormEditorSidebar.svelte";
    import {
        type FormQuestionDataSettings,
        type FormQuestionDataTypeDefinition,
        questionDataTypeRegistry,
    } from "@perfice/model/form/data";
    import {type FormQuestionDisplaySettings, questionDisplayTypeRegistry,} from "@perfice/model/form/display";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import EditTextOrDynamic from "@perfice/components/base/textOrDynamic/EditTextOrDynamic.svelte";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    import DragAndDropContainer from "@perfice/components/base/dnd/DragAndDropContainer.svelte";
    import {onMount} from "svelte";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";
    import {forms} from "@perfice/stores";
    import {back} from "@perfice/app";

    let {params}: { params: Record<string, string> } = $props();
    let form = $state<Form | undefined>(undefined);

    let creating = $state<string | null>(null);
    let createName = $state<string>("");
    let createIcon = $state<string>("");

    let currentQuestion = $state<FormQuestion | null>(null);
    let contextMenu = $state<ContextMenu | undefined>();

    // svelte-ignore non_reactive_update From bind:this
    let questionContainer: DragAndDropContainer;
    // svelte-ignore non_reactive_update From bind:this
    let sidebar: FormEditorSidebar;
    // svelte-ignore non_reactive_update From bind:this
    let editDisplayFormat: EditTextOrDynamic<FormQuestion>;


    function createQuestion(type: FormQuestionDisplayType) {
        if (form == null) return;

        let displayDefinition =
            questionDisplayTypeRegistry.getFieldByType(type);
        if (displayDefinition == null) return;
        let pair =
            questionDataTypeRegistry.getFirstSuitableForDisplayType(type);
        if (pair == null) return;

        let [dataType, def] = pair as [
            FormQuestionDataType,
            FormQuestionDataTypeDefinition<any, any>,
        ];

        let dataSettings: FormQuestionDataSettings = {
            dataType,
            dataSettings: def.getDefaultSettings(),
        };

        let displaySettings: FormQuestionDisplaySettings = {
            displayType: type,
            displaySettings: displayDefinition.getDefaultSettings(),
        };

        let question: FormQuestion = {
            id: crypto.randomUUID(),
            name: "",
            unit: null,
            defaultValue: null,
            ...dataSettings,
            ...displaySettings,
        };

        form.questions.push(question);

        if (form.format.length == 0) {
            // If format is empty, add the new question to be shown there
            form.format.push({
                dynamic: true,
                value: question.id
            });
            editDisplayFormat.invalidateItems();
        }

        let newQuestion = form.questions.find(q => q.id == question.id);
        if (newQuestion == null) return;

        // Necessary to use the stateful value inside the array
        editQuestion(newQuestion);
    }

    function editQuestion(q: FormQuestion) {
        currentQuestion = q;
        sidebar.open(q);
    }

    function deleteQuestion(question: FormQuestion) {
        if (form == undefined) return;
        form.questions = form.questions.filter((q) => q.id !== question.id);
        questionContainer.invalidateItems();

        form.format = form.format.filter(v => !v.dynamic || v.value != question.id);
        editDisplayFormat.invalidateItems();

        if (question.id == currentQuestion?.id) {
            sidebar.close();
        }
    }

    async function save() {
        if (form == undefined) return;

        let snapshot = $state.snapshot(form);
        if (creating == null) {
            await forms.updateForm(snapshot);
            back();
        } else {
            await forms.createForm(creating, createName, createIcon, snapshot.questions, snapshot.format);
        }
    }

    function onFormatChange(v: TextOrDynamic[]) {
        if (form == undefined) return;
        form.format = v;
    }

    function onSidebarQuestionChange(question: FormQuestion | null) {
        if (form == undefined || question == null) return;
        let index = form.questions.findIndex(q => q.id == question?.id);
        if (index == -1) return;

        form.questions[index] = question;
        currentQuestion = question;
    }

    async function loadForm() {
        let formId = params.formId;
        if (formId == undefined) return;

        if (formId.startsWith(NEW_FORM_ROUTE)) {
            let parts = formId.split(":");
            if (parts.length != 2) return;

            creating = parts[1];
            createName = "";
            createIcon = "";
            form = {
                id: crypto.randomUUID(),
                name: "",
                icon: "",
                snapshotId: crypto.randomUUID(),
                questions: [],
                format: []
            }
        } else {
            form = await forms.getFormById(formId);
        }
    }

    function startAddingQuestion(
        e: MouseEvent & { currentTarget: HTMLButtonElement },
    ) {
        contextMenu?.openFromClick(e.currentTarget, e.currentTarget);
    }

    function onReorderQuestions(items: FormQuestion[]) {
        if (form == undefined) return;
        form.questions = items;

        currentQuestion = form.questions.find(q => q.id == currentQuestion?.id) ?? null;

        if (currentQuestion != null) {
            sidebar.open(currentQuestion);
        }
    }

    let displayTypeButtons = questionDisplayTypeRegistry.getRegisteredDisplayTypes().map(([type, t]) => {
        return {
            name: t.getName(),
            icon: t.getIcon(),
            action: () => createQuestion(type as FormQuestionDisplayType),
        };
    })

    onMount(() => loadForm());
</script>

{#if form !== undefined}
    <MobileTopBar title={creating != null ? "Create form": form.name}>
        {#snippet leading()}
            <button class="icon-button" onclick={back}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            <button class="icon-button" onclick={save}>
                <Fa icon={faCheck}/>
            </button>
        {/snippet}
    </MobileTopBar>

    <FormEditorSidebar
            onClose={() => (currentQuestion = null)}
            onChange={onSidebarQuestionChange}
            bind:this={sidebar}
    />

    <div class="flex justify-between">
        <div class="p-2 flex-1 flex">
            <div class="mx-auto w-full lg:w-1/2 md:w-3/4 md:mt-8 main-content">
                <div class="bg-white hidden md:flex gap-2 border rounded-xl p-4 mb-8 fixed right-40 top-10">
                    <Button onClick={save}>Save</Button>
                    <Button color={ButtonColor.RED} onClick={back}>
                        Cancel
                    </Button>
                </div>

                {#if creating != null}
                    <div class="row-gap text-2xl text-gray-500 mt-4">
                        <Fa icon={faFont}/>
                        <p>Name & icon</p></div>
                    <div class="row-gap w-full mt-2">
                        <input id="first_name" bind:value={createName} placeholder="Name" type="text"
                               class="input flex-1">
                        <IconPickerButton right={true} icon={createIcon} onChange={(i) => createIcon = i}/>
                    </div>
                {/if}

                <div class="mb-4 mt-4">
                    <div class="row-gap text-2xl text-gray-500">
                        <Fa icon={faHeading}/>
                        <h2>Display format</h2>
                    </div>
                    <p class="text-xs mb-4">Decides which values to show in the journal</p>

                    <EditTextOrDynamic
                            bind:this={editDisplayFormat}
                            value={form.format}
                            availableDynamic={form.questions}
                            onChange={onFormatChange}
                            getDynamicId={(v) => v.id}
                            getDynamicText={(v) => v.name}
                    />
                </div>

                <hr class="my-8"/>
                <div
                        class="row-gap items-center text-2xl text-gray-500 mt-8 mb-4"
                >
                    <Fa icon={faQuestionCircle}/>
                    <h2>Questions</h2>
                </div>
                <DragAndDropContainer
                        zoneId="form-questions"
                        bind:this={questionContainer}
                        onFinalize={onReorderQuestions}
                        items={form.questions}
                        class="flex flex-col gap-4"
                >
                    {#snippet item(question, i)}
                        <FormFieldEdit
                                question={form.questions[i]}
                                selected={currentQuestion?.id === question.id}
                                onClick={() => editQuestion(question)}
                                onDelete={() => deleteQuestion(question)}
                        />
                    {/snippet}
                </DragAndDropContainer>

                <button
                        class="horizontal-add-button mt-4"
                        onclick={(e) => startAddingQuestion(e)}
                >
                    <Fa icon={faPlusCircle} class="pointer-events-none"/>
                </button>
            </div>
        </div>

        <div class="md:w-96"></div>

        <ContextMenu bind:this={contextMenu}>
            <ContextMenuButtons buttons={displayTypeButtons}
            />
        </ContextMenu>
    </div>
{:else}
    <h1>Form not found</h1>
{/if}

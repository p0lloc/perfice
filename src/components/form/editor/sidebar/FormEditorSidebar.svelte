<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {
        faCheck,
        faDumbbell,
        faFont,
    } from "@fortawesome/free-solid-svg-icons";
    import {
        type FormQuestion,
        FormQuestionDataType,
    } from "@perfice/model/form/form";
    import { questionDataTypeRegistry } from "@perfice/model/form/data";
    import EditDisplayQuestionSettings from "@perfice/components/form/editor/display/EditDisplayQuestionSettings.svelte";
    import EditDataQuestionSettings from "@perfice/components/form/editor/data/EditDataQuestionSettings.svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";

    let {
        onClose,
    }: {
        onClose: () => void;
    } = $props();

    let currentQuestion: FormQuestion | null = $state<FormQuestion | null>(
        null,
    );

    let sidebar: Sidebar;

    export function open(question: FormQuestion) {
        sidebar.open();
        currentQuestion = question;
    }

    export function close() {
        sidebar.close();
    }

    let dataTypeDef = $derived(
        questionDataTypeRegistry.getDefinition(
            currentQuestion?.dataType ?? FormQuestionDataType.TEXT,
        )!,
    );
</script>

<Sidebar
    title="Edit question"
    {onClose}
    closeButtonIcon={faCheck}
    class="md:w-96"
    bind:this={sidebar}
>
    {#if currentQuestion != null}
        <div class="overflow-y-scroll h-full pb-20">
            <div class="mt-4 px-4">
                <IconLabel icon={faFont} title="Name" />
                <input
                    type="text"
                    class="w-full border mt-2"
                    bind:value={currentQuestion.name}
                />
            </div>
            <div class="mt-4 px-4">
                <IconLabel icon={faDumbbell} title="Unit (optional)" />
                <input
                    type="text"
                    class="w-full border mt-2"
                    bind:value={currentQuestion.unit}
                    placeholder="kg, ml, ..."
                />
            </div>

            <EditDataQuestionSettings bind:currentQuestion />
            <EditDisplayQuestionSettings bind:currentQuestion {dataTypeDef} />
        </div>
    {/if}
</Sidebar>

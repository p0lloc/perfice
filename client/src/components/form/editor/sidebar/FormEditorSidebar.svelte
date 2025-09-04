<script lang="ts">
    import {faCheck, faDumbbell, faFont, faHashtag, faTimes,} from "@fortawesome/free-solid-svg-icons";
    import {type FormQuestion, FormQuestionDataType,} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import EditDisplayQuestionSettings
        from "@perfice/components/form/editor/display/EditDisplayQuestionSettings.svelte";
    import EditDataQuestionSettings from "@perfice/components/form/editor/data/EditDataQuestionSettings.svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";
    import type {PrimitiveValue} from "@perfice/model/primitive/primitive";
    import Button from "@perfice/components/base/button/Button.svelte";
    import EditConstant from "@perfice/components/variable/edit/EditConstant.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";

    let {
        onChange,
        onClose,
    }: {
        onChange: (question: FormQuestion | null) => void,
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

    function onNameChange(e: { currentTarget: HTMLInputElement }) {
        if (currentQuestion == null) return;
        onQuestionChange({
            ...currentQuestion,
            name: e.currentTarget.value,
        });
    }

    function onUnitChange(e: { currentTarget: HTMLInputElement }) {
        if (currentQuestion == null) return;

        let unit: string | null = e.currentTarget.value;
        if (unit == "") unit = null;

        onQuestionChange({
            ...currentQuestion,
            unit,
        });
    }

    function onDefaultChange(defaultValue: PrimitiveValue | null) {
        if (currentQuestion == null) return;
        onQuestionChange({
            ...currentQuestion,
            defaultValue: defaultValue
        });
    }

    function onQuestionChange(q: FormQuestion) {
        currentQuestion = q;
        onChange(currentQuestion);
    }

    function addDefaultValue() {
        if (currentQuestion == null) return;

        onDefaultChange(questionDataTypeRegistry.getDefaultPrimitiveValue(currentQuestion.dataType));
    }
</script>

<Sidebar
        title="Edit question"
        {onClose}
        closeButtonIcon={faCheck}
        class="md:w-96"
        bind:this={sidebar}
>
    {#if currentQuestion != null}
        <div class="overflow-y-scroll scrollbar-hide h-full pb-32">
            <div class="mt-4 px-4">
                <IconLabel icon={faFont} title="Name"/>
                <input
                        type="text"
                        class="w-full border mt-2"
                        value={currentQuestion.name}
                        onchange={onNameChange}
                />
            </div>
            <div class="mt-4 px-4">
                <IconLabel icon={faDumbbell} title="Unit (optional)"/>
                <input
                        type="text"
                        class="w-full border mt-2"
                        value={currentQuestion.unit}
                        onchange={onUnitChange}
                        placeholder="kg, ml, ..."
                />
            </div>
            <div class="mt-4 px-4 justify-between" class:flex={currentQuestion.defaultValue == null}>
                <IconLabel icon={faHashtag} title="Default value"/>
                {#if currentQuestion.defaultValue != null}
                    <div class="mt-2 flex gap-2">
                        <EditConstant dataType={currentQuestion.dataType}
                                      onChange={onDefaultChange}
                                      value={currentQuestion.defaultValue}/>
                        <button onclick={() => onDefaultChange(null)}>
                            <Fa icon={faTimes}/>
                        </button>
                    </div>
                {:else}
                    <Button onClick={addDefaultValue}>Add</Button>
                {/if}
            </div>

            <EditDataQuestionSettings {currentQuestion} onChange={onQuestionChange}/>
            <EditDisplayQuestionSettings {currentQuestion} onChange={onQuestionChange} {dataTypeDef}/>
        </div>
    {/if}
</Sidebar>

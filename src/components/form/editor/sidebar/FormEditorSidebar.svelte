<script lang="ts">
    import {faCheck, faDumbbell, faFont,} from "@fortawesome/free-solid-svg-icons";
    import {type FormQuestion, FormQuestionDataType,} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import EditDisplayQuestionSettings
        from "@perfice/components/form/editor/display/EditDisplayQuestionSettings.svelte";
    import EditDataQuestionSettings from "@perfice/components/form/editor/data/EditDataQuestionSettings.svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import Sidebar from "@perfice/components/base/sidebar/Sidebar.svelte";

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

    function onQuestionChange(q: FormQuestion) {
        currentQuestion = q;
        onChange(currentQuestion);
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

            <EditDataQuestionSettings {currentQuestion} onChange={onQuestionChange}/>
            <EditDisplayQuestionSettings {currentQuestion} onChange={onQuestionChange} {dataTypeDef}/>
        </div>
    {/if}
</Sidebar>

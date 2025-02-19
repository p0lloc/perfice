<script lang="ts">
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faCheck, faDumbbell, faFont, faTimes} from "@fortawesome/free-solid-svg-icons";
    import {type FormQuestion, FormQuestionDataType} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import EditDisplayQuestionSettings
        from "@perfice/components/form/editor/display/EditDisplayQuestionSettings.svelte";
    import EditDataQuestionSettings from "@perfice/components/form/editor/data/EditDataQuestionSettings.svelte";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";

    let {currentQuestion = $bindable(), onClose}: {
        currentQuestion: FormQuestion | null,
        onClose: () => void
    } = $props();

    let dataTypeDef = $derived(questionDataTypeRegistry.getDefinition(currentQuestion?.dataType ?? FormQuestionDataType.TEXT)!);
</script>
<div class:invisible={currentQuestion == null}
     class="right-sidebar md:w-96">
    {#if currentQuestion != null}
        <div class="row-between text-2xl p-4 font-bold border-b">
            Edit question
            <button class="icon-button" onclick={onClose}>
                <Fa icon={faCheck}/>
            </button>
        </div>
        <div class="overflow-y-scroll h-full pb-20">
            <div class="mt-4 px-4">
                <IconLabel icon={faFont} title="Name"/>
                <input type="text" class="w-full border mt-2" bind:value={currentQuestion.name}/>
            </div>
            <div class="mt-4 px-4">
                <IconLabel icon={faDumbbell} title="Unit (optional)"/>
                <input type="text" class="w-full border mt-2" bind:value={currentQuestion.unit}
                       placeholder="kg, ml, ..."/>
            </div>

            <EditDataQuestionSettings bind:currentQuestion/>
            <EditDisplayQuestionSettings bind:currentQuestion {dataTypeDef}/>
        </div>
    {/if}
</div>

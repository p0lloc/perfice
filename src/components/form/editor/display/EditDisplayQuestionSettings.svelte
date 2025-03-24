<script lang="ts">

    import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import {type FormFieldProps, QUESTION_DISPLAY_TYPES} from "@perfice/model/form/ui";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import SidebarDropdownHeader from "@perfice/components/form/editor/sidebar/SidebarDropdownHeader.svelte";
    import type {Component} from "svelte";
    import InputFormField from "@perfice/components/form/fields/input/InputFormField.svelte";
    import RangeFormField from "@perfice/components/form/fields/range/RangeFormField.svelte";
    import SegmentedFormField from "@perfice/components/form/fields/segmented/SegmentedFormField.svelte";
    import SelectFormField from "@perfice/components/form/fields/select/SelectFormField.svelte";
    import HierarchyFormField from "@perfice/components/form/fields/hierarchy/HierarchyFormField.svelte";
    import RichInputFormField from "@perfice/components/form/fields/richInput/RichInputFormField.svelte";
    import EditSelectQuestionSettings
        from "@perfice/components/form/editor/display/select/EditSelectQuestionSettings.svelte";
    import EditSegmentedQuestionSettings
        from "@perfice/components/form/editor/display/segmented/EditSegmentedQuestionSettings.svelte";
    import EditRangeQuestionSettings
        from "@perfice/components/form/editor/display/range/EditRangeQuestionSettings.svelte";

    let {currentQuestion = $bindable(), dataTypeDef}: {
        currentQuestion: FormQuestion,
        dataTypeDef: FormQuestionDataTypeDefinition<any, any>
    } = $props();

    function changeDisplayType(type: FormQuestionDisplayType) {
        if (currentQuestion == null) return;
        let definition = questionDisplayTypeRegistry.getFieldByType(type)!;

        currentQuestion.displayType = type;
        currentQuestion.displaySettings = definition.getDefaultSettings();
    }

    function getDisplayDropdownItems(dataTypeDef: FormQuestionDataTypeDefinition<any, any>): DropdownMenuItem<FormQuestionDisplayType>[] {
        return QUESTION_DISPLAY_TYPES
            .filter(d => dataTypeDef.getSupportedDisplayTypes().includes(d.type)) // Only include supported display types for this data type
            .map(d => {
                return {
                    name: d.name,
                    icon: d.icon,
                    value: d.type,
                    action: () => changeDisplayType(d.type),
                }
            })
    }


    const FIELD_RENDERERS: Partial<Record<FormQuestionDisplayType, Component<{
        settings: any,
        dataType: FormQuestionDataType,
        dataSettings: any
    }>>> = {
        [FormQuestionDisplayType.SELECT]: EditSelectQuestionSettings,
        [FormQuestionDisplayType.SEGMENTED]: EditSegmentedQuestionSettings,
        [FormQuestionDisplayType.RANGE]: EditRangeQuestionSettings,
    }

    const RendererComponent = $derived(FIELD_RENDERERS[currentQuestion.displayType]);
</script>
<SidebarDropdownHeader icon={faLayerGroup} title="Display type" value={currentQuestion.displayType}
                       items={getDisplayDropdownItems(dataTypeDef)}/>

<div class="p-4">
    {#if RendererComponent != null}
        <RendererComponent bind:settings={currentQuestion.displaySettings} dataType={currentQuestion.dataType}
                           dataSettings={currentQuestion.dataSettings}/>
    {:else}
        There are no settings for this display type
    {/if}
</div>

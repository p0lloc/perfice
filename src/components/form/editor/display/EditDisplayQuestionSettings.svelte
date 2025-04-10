<script lang="ts">
    import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import type {FormQuestionDataTypeDefinition} from "@perfice/model/form/data";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import SidebarDropdownHeader from "@perfice/components/form/editor/sidebar/SidebarDropdownHeader.svelte";
    import type {Component} from "svelte";
    import EditSelectQuestionSettings
        from "@perfice/components/form/editor/display/select/EditSelectQuestionSettings.svelte";
    import EditSegmentedQuestionSettings
        from "@perfice/components/form/editor/display/segmented/EditSegmentedQuestionSettings.svelte";
    import EditRangeQuestionSettings
        from "@perfice/components/form/editor/display/range/EditRangeQuestionSettings.svelte";
    import EditHierarchyQuestionDisplaySettings
        from "@perfice/components/form/editor/display/hierarchy/EditHierarchyQuestionDisplaySettings.svelte";

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
        return questionDisplayTypeRegistry.getRegisteredDisplayTypes()
            .filter(([type]) => dataTypeDef.getSupportedDisplayTypes().includes(type as FormQuestionDisplayType)) // Only include supported display types for this data type
            .map(([type, d]) => {
                return {
                    name: d.getName(),
                    icon: d.getIcon(),
                    value: type as FormQuestionDisplayType,
                    action: () => changeDisplayType(type as FormQuestionDisplayType),
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
        [FormQuestionDisplayType.HIERARCHY]: EditHierarchyQuestionDisplaySettings,
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

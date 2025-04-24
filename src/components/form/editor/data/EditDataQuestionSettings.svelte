<script lang="ts">
    import {type FormQuestion, FormQuestionDataType} from "@perfice/model/form/form";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import SidebarDropdownHeader from "@perfice/components/form/editor/sidebar/SidebarDropdownHeader.svelte";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import type {Component} from "svelte";
    import EditTextQuestionSettings from "@perfice/components/form/editor/data/text/EditTextQuestionSettings.svelte";
    import EditNumberQuestionSettings
        from "@perfice/components/form/editor/data/number/EditNumberQuestionSettings.svelte";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import EditHierarchyQuestionSettings
        from "@perfice/components/form/editor/data/hierarchy/EditHierarchyQuestionSettings.svelte";

    let {currentQuestion, onChange}: { currentQuestion: FormQuestion, onChange: (v: FormQuestion) => void } = $props();

    function changeDataType(type: FormQuestionDataType) {
        if (currentQuestion == null) return;
        let definition = questionDataTypeRegistry.getDefinition(type)!;

        let supportedDisplays = definition.getSupportedDisplayTypes();
        if (!supportedDisplays.includes(currentQuestion.displayType)) {
            // If data type changes but the current display type is incompatible, set it to a compatible one
            currentQuestion.displayType = supportedDisplays[0];
        }

        currentQuestion.dataType = type;
        currentQuestion.dataSettings = definition.getDefaultSettings();

        let displayDef = questionDisplayTypeRegistry.getFieldByType(currentQuestion.displayType)!;
        if (displayDef != null) {
            // Transform the display settings to the new data type
            currentQuestion.displaySettings = displayDef.onDataTypeChanged(currentQuestion.displaySettings, type, definition.getPrimitiveType());
        }

        onChange(currentQuestion);
    }

    function onDataSettingsChange(v: any) {
        onChange({...currentQuestion, dataSettings: v});
    }

    function getDataDropdownItems(): DropdownMenuItem<FormQuestionDataType>[] {
        return questionDataTypeRegistry.getDefinitions().map(([type, d]) => {
            return {
                name: d.getName(),
                icon: d.getIcon(),
                value: type as FormQuestionDataType,
                action: () => changeDataType(type as FormQuestionDataType),
            }
        })
    }

    const FIELD_RENDERERS: Partial<Record<FormQuestionDataType, Component<{
        settings: any,
        onChange: (settings: any) => void
    }>>> = {
        [FormQuestionDataType.TEXT]: EditTextQuestionSettings,
        [FormQuestionDataType.NUMBER]: EditNumberQuestionSettings,
        [FormQuestionDataType.HIERARCHY]: EditHierarchyQuestionSettings,
    }

    const RendererComponent = $derived(FIELD_RENDERERS[currentQuestion.dataType]);
</script>
<SidebarDropdownHeader icon={faLayerGroup} title="Data type" value={currentQuestion.dataType}
                       items={getDataDropdownItems()}/>
<div class="p-4">
    {#if RendererComponent != null}
        <RendererComponent settings={currentQuestion.dataSettings} onChange={onDataSettingsChange}/>
    {:else}
        There are no settings for this data type
    {/if}
</div>

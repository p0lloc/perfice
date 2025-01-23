<script lang="ts">
    import {type FormQuestion, FormQuestionDataType} from "@perfice/model/form/form";
    import {type DataSettingValues, questionDataTypeRegistry} from "@perfice/model/form/data";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";
    import {QUESTION_DATA_TYPES} from "@perfice/model/form/ui";
    import SidebarDropdownHeader from "@perfice/components/form/editor/sidebar/SidebarDropdownHeader.svelte";
    import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";
    import type {Component} from "svelte";
    import EditTextQuestionSettings from "@perfice/components/form/editor/data/text/EditTextQuestionSettings.svelte";
    import EditNumberQuestionSettings
        from "@perfice/components/form/editor/data/number/EditNumberQuestionSettings.svelte";

    let {currentQuestion = $bindable()}: { currentQuestion: FormQuestion } = $props();

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
    }

    function getDataDropdownItems(): DropdownMenuItem<FormQuestionDataType>[] {
        return QUESTION_DATA_TYPES.map(d => {
            return {
                name: d.name,
                icon: d.icon,
                value: d.type,
                action: () => changeDataType(d.type),
            }
        })
    }

    const FIELD_RENDERERS: Partial<Record<FormQuestionDataType, Component<{ settings: any }>>> = {
        [FormQuestionDataType.TEXT]: EditTextQuestionSettings,
        [FormQuestionDataType.NUMBER]: EditNumberQuestionSettings,
    }

    const RendererComponent = $derived(FIELD_RENDERERS[currentQuestion.dataType]);
</script>
<SidebarDropdownHeader icon={faLayerGroup} title="Data type" value={currentQuestion.dataType}
                       items={getDataDropdownItems()}/>
<div class="p-4">
    {#if RendererComponent != null}
        <RendererComponent bind:settings={currentQuestion.dataSettings}/>
    {:else}
        There are no settings for this data type
    {/if}
</div>

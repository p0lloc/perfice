<script lang="ts">
    import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {SelectedField} from "@perfice/model/integration/ui";
    import type {DropdownMenuItem} from "@perfice/model/ui/dropdown";

    let {selectedField, fields, questionItems, onChange}: {
        selectedField: SelectedField,
        fields: DropdownMenuItem<string | null>[],
        questionItems: DropdownMenuItem<string>[],
        onChange: (selectedField: SelectedField) => void
    } = $props();

    function onQuestionChange(questionId: string) {
        onChange({
            ...selectedField,
            questionId
        });
    }

    function onFieldChange(integrationField: string | null) {
        onChange({
            ...selectedField,
            integrationField
        });
    }
</script>

<div class="flex gap-2 items-center md:flex-row flex-col">
    <DropdownButton class="flex-1 w-full md:w-auto" items={fields} value={selectedField.integrationField}
                    noneText="Empty" onChange={onFieldChange}/>
    <Fa icon={faArrowRight} class="hidden md:block"/>
    <DropdownButton class="flex-1 w-full md:w-auto" items={questionItems} value={selectedField.questionId}
                    onChange={onQuestionChange}/>
</div>

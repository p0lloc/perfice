<script lang="ts">
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";

    let embed = $state<FormEmbed | undefined>();

    function log() {
        console.log(embed?.validateAndGetAnswers());
    }

    let questions: FormQuestion[] = [{
        id: crypto.randomUUID(),
        name: "test",
        displayType: FormQuestionDisplayType.INPUT,
        displaySettings: {},
        dataType: FormQuestionDataType.TEXT,
        dataSettings: {
            minLength: null,
            maxLength: null,
        }
    },
        {
            id: crypto.randomUUID(),
            name: "test",
            displayType: FormQuestionDisplayType.INPUT,
            displaySettings: {},
            dataType: FormQuestionDataType.NUMBER,
            dataSettings: {
                min: 0,
                max: 20,
            }
        }
    ];
</script>
<FormEmbed bind:this={embed} questions={questions} answers={{}}/>

<button onclick={log}>log</button>

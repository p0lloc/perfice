<script lang="ts">
    import FormEmbed from "@perfice/components/form/FormEmbed.svelte";
    import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";

    let formModal: FormModal;

    function log() {
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

        formModal.open({id: crypto.randomUUID(), name: "test", questions}, new Date(), {});
    }

</script>

<FormModal bind:this={formModal} />
<button onclick={log}>log</button>

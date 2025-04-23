<script lang="ts">
    import {
        type Form,
        type FormQuestion,
        FormQuestionDataType,
        FormQuestionDisplayType,
    } from "@perfice/model/form/form";
    import type {DynamicInputAnswer, DynamicInputEntity, DynamicInputField,} from "@perfice/model/ui/dynamicInput";
    import {primitiveAsString, type PrimitiveValue, pString,} from "@perfice/model/primitive/primitive";
    import type {HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import {parseAndValidateValue} from "@perfice/model/form/validation";
    import {questionDisplayTypeRegistry} from "@perfice/model/form/display";
    import {questionDataTypeRegistry} from "@perfice/model/form/data";
    import type {Tag} from "@perfice/model/tag/tag";
    import DynamicInput from "@perfice/components/base/dynamic/DynamicInput.svelte";
    import {getCurrentRoute, routingNavigatorState} from "@perfice/model/ui/router.svelte";
    import {forms, journal, tags} from "@perfice/stores";

    function hierarchyOptionToInputOption(
        option: HierarchyOption,
    ): DynamicInputField {
        return {
            id: "",
            name: primitiveAsString(option.value),
            nested: true,
            fields:
                option.children.length > 0
                    ? option.children.map(hierarchyOptionToInputOption)
                    : undefined,
        };
    }

    function formatInputAnswer(answer: string, question: FormQuestion) {
        let subArgs = answer.split("|");

        if (question.dataType == FormQuestionDataType.HIERARCHY) {
            return subArgs.map((v) => pString(v));
        } else {
            if (subArgs.length < 2) return answer;
            return subArgs;
        }
    }

    async function validateAnswer(
        inputAnswer: DynamicInputAnswer,
    ): Promise<boolean> {
        if (inputAnswer.type != "form") return true;

        return (await parseAnswer(inputAnswer)) != null;
    }

    async function parseAnswer(
        inputAnswer: DynamicInputAnswer,
    ): Promise<[Form, Record<string, PrimitiveValue>] | null> {
        let form = await forms.getFormById(inputAnswer.id);
        if (form == null) return null;

        if (inputAnswer.answers.length != form.questions.length) return null;

        let answers: Record<string, PrimitiveValue> = {};
        for (let i = 0; i < form.questions.length; i++) {
            let question = form.questions[i];
            let answer = inputAnswer.answers[i];

            let final = formatInputAnswer(answer, question);

            let [value, error] = parseAndValidateValue(
                final,
                question,
                questionDataTypeRegistry.getDefinition(question.dataType)!,
                questionDisplayTypeRegistry.getFieldByType(
                    question.displayType,
                )!,
            );

            if (error != null || value == null) return null;

            answers[question.id] = value;
        }

        return [form, answers];
    }

    async function onSubmit(answers: DynamicInputAnswer[]) {
        for (let answer of answers) {
            switch (answer.type) {
                case "form": {
                    let val = await parseAnswer(answer);
                    if (val == null) continue;
                    let [form, parsed] = val;

                    await journal.logEntry(
                        form,
                        parsed,
                        form.format,
                        new Date().getTime(),
                    );
                    break;
                }
                case "tag": {
                    await tags.logTag(answer.id, new Date());
                    break;
                }
            }
        }
    }

    function mapTagsToInputEntities(tags: Tag[]): DynamicInputEntity[] {
        return tags.map((t) => {
            return {
                id: t.id,
                type: "tag",
                name: t.name,
                fields: [],
            };
        });
    }

    function mapFormsToInputEntities(forms: Form[]): DynamicInputEntity[] {
        let res: DynamicInputEntity[] = [];
        for (let form of forms) {
            let fields: DynamicInputField[] = [];
            for (let question of form.questions) {
                let fieldOptions: DynamicInputField[] | undefined = undefined;

                switch (question.displayType) {
                    case FormQuestionDisplayType.SEGMENTED:
                    case FormQuestionDisplayType.SELECT:
                        fieldOptions = question.displaySettings.options.map(
                            (o) => {
                                return {
                                    id: "",
                                    name: primitiveAsString(o.value),
                                };
                            },
                        );
                        break;
                }

                switch (question.dataType) {
                    case FormQuestionDataType.BOOLEAN:
                        fieldOptions = [
                            {id: "true", name: "true"},
                            {id: "false", name: "false"},
                        ];
                        break;
                    case FormQuestionDataType.HIERARCHY:
                        fieldOptions = question.dataSettings.root.children.map(
                            hierarchyOptionToInputOption,
                        );
                        break;
                }

                fields.push({
                    id: question.id,
                    name: question.name,
                    nested: question.dataType == FormQuestionDataType.HIERARCHY,
                    fields: fieldOptions,
                });
            }

            res.push({
                id: form.id,
                type: "form",
                name: form.name.toLowerCase().replace(" ", "-"),
                fields,
            });
        }

        return res;
    }

    const VISIBLE_ROUTES = ["/", "/trackables", "/tags", "/goals"];

    let visible = $derived(VISIBLE_ROUTES.includes(getCurrentRoute(routingNavigatorState)));
</script>

{#if visible}
    {#await $forms then forms}
        {#await $tags then tags}
            <div
                    class="hidden fixed bottom-12 md:bottom-0 h-12 md:flex items-center justify-center w-screen px-4 z-50"
            >
                <div class="bg-white w-1/3 p-2 rounded-t-md border">
                    <DynamicInput
                            entities={[
					...mapFormsToInputEntities(forms),
					...mapTagsToInputEntities(tags),
				]}
                            {validateAnswer}
                            {onSubmit}
                    />
                </div>
            </div>
        {/await}
    {/await}
{/if}
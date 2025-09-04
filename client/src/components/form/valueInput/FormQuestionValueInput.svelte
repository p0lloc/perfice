<script lang="ts">
    import {type FormQuestion, FormQuestionDataType, FormQuestionDisplayType} from "@perfice/model/form/form";
    import {comparePrimitives, pList, type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {HIERARCHY_ROOT_ID, type HierarchyOption} from "@perfice/model/form/data/hierarchy";
    import PrimitiveVanillaInputField from "@perfice/components/form/valueInput/PrimitiveVanillaInputField.svelte";

    let {question, value, onChange, class: className = "", small = false}: {
        question: FormQuestion,
        value: PrimitiveValue,
        onChange: (v: PrimitiveValue) => void,
        class?: string,
        small?: boolean
    } = $props();

    let options: { name: string, value: PrimitiveValue }[] | null = $derived.by(() => {
        switch (question.displayType) {
            case FormQuestionDisplayType.HIERARCHY: {
                if (question.dataType != FormQuestionDataType.HIERARCHY) return null;

                let options: { name: string, value: PrimitiveValue }[] = [];

                function addOption(current: HierarchyOption, path: PrimitiveValue[]) {
                    if (current.id != HIERARCHY_ROOT_ID) {
                        path.push(current.value);
                        options.push({
                            value: pList(structuredClone(path)),
                            name: current.text,
                        });
                    }
                    current.children.forEach(v => {
                        addOption(v, path);
                    });
                    path.pop();
                }

                addOption($state.snapshot(question.dataSettings.root), []);
                return options;
            }
            case FormQuestionDisplayType.SEGMENTED: {
                return question.displaySettings.options.map(v => {
                    return {
                        value: v.value,
                        name: v.text
                    }
                });
            }
            case FormQuestionDisplayType.SELECT: {
                return question.displaySettings.options.map(v => {
                    return {
                        value: v.value,
                        name: v.text
                    }
                });
            }

            default:
                return null;
        }
    });
</script>


{#if options != null}
    <DropdownButton {small} compareFunction={comparePrimitives} class={className} items={options} value={value}
                    onChange={onChange}/>
{:else}
    <PrimitiveVanillaInputField class={className}
                                dataType={question.dataType} value={value} onChange={onChange}/>
{/if}
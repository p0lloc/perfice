<script lang="ts">
    import DynamicLabel from "./DynamicLabel.svelte";
    import type {DynamicInputAnswer, DynamicInputEntity, DynamicInputField,} from "@perfice/model/ui/dynamicInput";
    import createFuzzySearch from "@nozbe/microfuzz";

    let {
        entities,
        validateAnswer,
        onSubmit,
    }: {
        entities: DynamicInputEntity[];
        validateAnswer: (answers: DynamicInputAnswer) => Promise<boolean>;
        onSubmit: (answers: DynamicInputAnswer[]) => void;
    } = $props();
    let currentEntity = $state<DynamicInputEntity | undefined>(undefined);

    let dynamic = $state<DynamicInputAnswer[]>([]);
    let suggestions: string[] = $state([]);
    let currentField = $state<DynamicInputField | undefined>(undefined);
    let suggestionStart: number = $state(0);
    let suggestionEnd: number = $state(0);
    let suggestionSuffix: string = $state(",");

    let inputField: HTMLInputElement;

    function currentWord(full: string, cursorPos: number): number {
        let start = 0;
        for (let i = cursorPos; i >= 0; i--) {
            if (full.charAt(i) == "#") {
                break;
            }

            start = i;
        }

        return start;
    }

    function splitWithIndices(
        str: string,
        delim: string,
    ): [string[], number[]] {
        let result = [];
        let indices = [];
        let lastIndex = 0;
        let offset = 0; // To account for multi-character delimiters

        while ((offset = str.indexOf(delim, lastIndex)) !== -1) {
            result.push(str.substring(lastIndex, offset));
            indices.push(offset);
            lastIndex = offset + delim.length;
        }

        // Push the remaining part of the string
        result.push(str.substring(lastIndex));

        return [result, indices];
    }

    function replaceRange(
        s: string,
        start: number,
        end: number,
        substitute: string,
    ) {
        return s.substring(0, start) + substitute + s.substring(end);
    }

    async function onKeydown(e: KeyboardEvent) {
        const target = e.target as HTMLInputElement;
        let value = target.value;
        switch (e.key) {
            case "Backspace": {
                if (value != "") break;
                dynamic.pop();
                break;
            }

            case "Tab": {
                e.preventDefault();
                if (suggestions.length == 0) return;

                const cursorPos = target.selectionStart ?? 0;
                let start = currentWord(value, cursorPos);
                let suggestion = suggestions[0];
                if (currentEntity == null) {
                    let entity = entities.find((e) => e.name == suggestion);
                    if (entity == null) return;
                    target.value = replaceRange(
                        value,
                        start,
                        value.length,
                        suggestion + suggestionSuffix,
                    );

                    currentField = entity.fields[0];
                } else {
                    target.value = replaceRange(
                        value,
                        suggestionStart + 1,
                        suggestionEnd + 1,
                        suggestion + suggestionSuffix,
                    );
                }
                break;
            }
            case "Enter": {
                if (value.length == 0) {
                    onSubmit(dynamic);
                    dynamic = [];
                    target.value = "";
                    return;
                }

                if (currentEntity == null) return;

                let answers = target.value.split(",").slice(1);
                let answer: DynamicInputAnswer = {
                    id: currentEntity.id,
                    type: currentEntity.type,
                    name: currentEntity.name,
                    answers: answers,
                };

                if (!(await validateAnswer(answer))) {
                    return;
                }

                dynamic.push(answer);
                target.value = "";
                currentField = undefined;
                break;
            }
        }

        setTimeout(() => {
            let full = target.value;
            const fullCursorPos = target.selectionStart ?? 0;
            let start = currentWord(full, fullCursorPos);
            let cursorPos = fullCursorPos - start - 1;

            let value = full.substring(start);
            let [args, argumentIndices] = splitWithIndices(value, ",");

            currentEntity = entities.find((e) => e.name == args[0]);
            if (currentEntity != null) {
                if (currentEntity.fields.length != 0) {
                    // Only set current entity if we've started the argument list with a comma
                    currentEntity = args.length < 2 ? undefined : currentEntity;
                } else {
                    // Entities without fields don't need arguments
                    suggestionSuffix = "";
                    return;
                }
            }

            if (args.length > 1 && currentEntity != null) {
                let o = argumentIndices.filter((i) => cursorPos >= i);
                let argumentIndex = o.length - 1;
                let argumentStart = o.length > 0 ? o[argumentIndex] + 1 : 0;
                let argumentEnd =
                    argumentIndices.length > o.length
                        ? argumentIndices[o.length]
                        : value.length;
                let argumentContent = value.substring(
                    argumentStart,
                    argumentEnd,
                );
                let topField = currentEntity.fields[argumentIndex];

                suggestionStart = argumentStart;
                suggestionEnd = argumentEnd;
                suggestionSuffix =
                    argumentIndex < currentEntity.fields.length - 1 ? "," : "";

                if (topField == null) return;

                let curr: DynamicInputField = topField;
                let search = argumentContent;
                if (topField.fields) {
                    let [subArgs, rawSubArgumentIndices] = splitWithIndices(
                        argumentContent,
                        "|",
                    );
                    // Subargs input doesn't start with a pipe, so we need to add a dummy argument
                    let subArgumentIndices = [-1, ...rawSubArgumentIndices];

                    let o = subArgumentIndices.filter(
                        (i) => cursorPos >= argumentStart + i,
                    );
                    let subArgumentIndex = o.length - 1;
                    let subArgumentStart =
                        argumentStart +
                        (o.length > 0 ? o[subArgumentIndex] + 1 : 0);
                    let subArgumentEnd =
                        subArgumentIndices.length > o.length
                            ? argumentStart + subArgumentIndices[o.length]
                            : argumentEnd;
                    let subArgumentContent = subArgs[subArgumentIndex];

                    suggestionStart = subArgumentStart;
                    suggestionEnd = subArgumentEnd;
                    search = subArgumentContent;

                    if (curr.nested === true) {
                        for (let x of subArgs) {
                            let val: DynamicInputField | undefined =
                                curr.fields?.find((v) => v.name == x);
                            if (val == undefined) continue;

                            curr = val;
                        }
                    }
                }

                currentField = curr;

                if (curr.fields == undefined) {
                    suggestions = [];
                    return;
                }

                let suggested: DynamicInputField[] = [];
                if (search == "") {
                    suggested = curr.fields.slice(0, 3);
                } else {
                    const fuzzySearch = createFuzzySearch(
                        $state.snapshot(curr.fields),
                        {key: "name"},
                    );
                    suggested = fuzzySearch(search).map((v) => v.item);
                }

                if (suggested.length > 0) {
                    suggestionSuffix =
                        suggested[0].fields != undefined
                            ? "|"
                            : suggestionSuffix;
                }

                suggestions = suggested.map((v) => v.name);
            } else {
                if (full.charAt(start - (start != 0 ? 1 : 0)) != "#") {
                    suggestions = [];
                    return;
                }

                let suggested: DynamicInputEntity[];
                if (value == "") {
                    suggested = entities.slice(0, 3);
                } else {
                    const fuzzySearch = createFuzzySearch(entities, {
                        key: "name",
                    });

                    suggested = fuzzySearch(value).map((v) => v.item);
                }

                if (suggested.length > 0) {
                    suggestionSuffix =
                        suggested[0].fields.length > 0 ? "," : "";
                }
                suggestions = suggested.map((v) => v.name);
                currentField = undefined;
            }
        });
    }

    function handleBodyKeydown(e: KeyboardEvent) {
        if (e.ctrlKey && e.key == "k") {
            e.preventDefault();
            e.stopPropagation();

            inputField.focus();
        }
    }
</script>

<svelte:body on:keydown={handleBodyKeydown}/>

{#if (currentField != null && currentEntity != null) || suggestions.length > 0}
    <div class="fixed bottom-12 flex gap-2 bg-white border-t border-x  rounded-t-md p-2">
        {#if suggestions.length > 0}
            {#each suggestions as suggestion}
                <span>{suggestion}</span>
            {/each}
        {:else if currentField != null && currentEntity != null}
            {currentField.name}
        {/if}
        <span class="text-gray-400"
        >({suggestionSuffix === "" ? "Enter" : "Tab"})</span
        >
    </div>
{/if}
<div
        class="flex flex-wrap items-center border rounded-md inp py-1 px-2 gap-1"
>
    {#each dynamic as v}
        <DynamicLabel>{v.name}</DynamicLabel>
    {/each}
    <input
            bind:this={inputField}
            type="text"
            placeholder="#food,rice|chicken,2000 (Ctrl+K)"
            onkeydown={onKeydown}
            class="border-none outline-none flex-1"
            value=""
    />
</div>

<style>
    input[type="text"] {
        padding: 0;
    }
</style>

<script lang="ts">
    import {type IntegrationOption, IntegrationOptionType} from "@perfice/model/integration/integration";

    let {definition, options}: {
        definition: Record<string, IntegrationOption>,
        options: Record<string, string | number>
    } = $props();

    let optionState = $state(options);

    function getInputType(option: IntegrationOption): string {
        switch (option.type) {
            case IntegrationOptionType.TEXT:
                return "text";
            case IntegrationOptionType.NUMBER:
                return "number";
        }
    }

    export function save(): Record<string, string | number> | null {
        let options: Record<string, string | number> = {};
        for (let [key, value] of Object.entries(optionState)) {
            switch (definition[key].type) {
                case IntegrationOptionType.TEXT:
                    options[key] = value;
                    break;
                case IntegrationOptionType.NUMBER:
                    let parsed = parseFloat(value.toString());
                    if (isNaN(parsed)) {
                        return null;
                    }

                    options[key] = parsed;
                    break;
            }
        }
        return options;
    }
</script>

<div class="flex flex-col md:gap-2 gap-8 mt-8">
    {#each Object.entries(definition) as [key, option]}
        <div class="flex flex-col gap-2">
            <p class="text-sm font-bold">{option.name}</p>
            <input type={getInputType(option)} class="input" bind:value={optionState[key]}/>
        </div>
    {/each}
</div>
<script lang="ts">
    import type {SelectFormQuestionSettings, SelectOption} from "@perfice/model/form/display/select";
    import type {FormFieldProps} from "@perfice/model/form/ui";
    import SelectOptionButton from "@perfice/components/form/fields/select/SelectOptionButton.svelte";

    let {dataSettings, displaySettings, disabled, value, onChange}: FormFieldProps = $props();

    function selectOption(o: SelectOption) {
        if (disabled) return;
        let selectedValue = structuredClone(o.value);
        if (Array.isArray(value)) {
            let newValues;
            if (isOptionSelected(o)) {
                newValues = value.filter(v => v != o.value.value);
            } else {
                newValues = [...value, selectedValue.value];
            }

            onChange(newValues);
        } else {
            onChange(selectedValue.value);
        }
    }

    function isOptionSelected(o: SelectOption): boolean {
        if (Array.isArray(value)) {
            return value.some(v => v == o.value.value);
        } else {
            return value == o.value.value;
        }
    }

    let display = displaySettings as SelectFormQuestionSettings;
</script>


{#if display.grid != null}
    <div class="grid gap-2 select-grid bg-white"
         style:--width="{Math.min(display.grid.itemsPerRow / 4, 1) * 75}%"
         class:select-grid-border={display.grid.border}
         style:grid-template-columns="repeat({display.grid.itemsPerRow}, minmax(0, 1fr))">
        {@render list(display)}
    </div>
{:else}
    <div class="flex gap-2 flex-wrap">
        {@render list(display)}
    </div>
{/if}

{#snippet list(display: SelectFormQuestionSettings)}
    {#each display.options as option}
        <SelectOptionButton selected={isOptionSelected(option)} {option} onClick={() => selectOption(option)} grid={display.grid != null}/>
    {/each}
{/snippet}

<style>
    .select-grid-border {
        @apply border p-4 rounded-xl;
    }

    .select-grid {
        width: 100%;
    }

    @media (min-width: 768px) {
        .select-grid {
            width: var(--width);
        }
    }
</style>

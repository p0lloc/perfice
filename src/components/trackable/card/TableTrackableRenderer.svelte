<script lang="ts">
    import {type DisplayValue, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {TrackableValueSettings} from "@perfice/model/trackable/trackable";

    let {value, cardSettings}: { value: PrimitiveValue, cardSettings: TrackableValueSettings } = $props();


    function getEntryValue(d: PrimitiveValue) {
        if(d.type != PrimitiveValueType.ENTRY) return "Invalid value";

        let answerMap: Record<string, PrimitiveValue> = (d.value.value);

        let result: string = "";
        for (let rep of cardSettings.representation) {
            if (rep.dynamic) {
                let answerValue = answerMap[rep.value];
                if (answerValue == null) return "Invalid value";

                let displayValue = (answerValue.value as DisplayValue);
                let display = displayValue.display?.value ?? displayValue.value;
                result += display.toString();
            } else {
                result += rep.value;
            }
        }

        return result;
    }

    let values = $derived(value.value as PrimitiveValue[]);
</script>
<div class="flex h-full flex-col overflow-y-scroll scrollbar-hide">
    {#each values as d}
        <div class="w-full [&:not(:last-child)]:border-b">
            {getEntryValue(d)}
        </div>
    {:else}
        <div class="justify-center items-center flex flex-1">
            No values
        </div>
    {/each}

</div>

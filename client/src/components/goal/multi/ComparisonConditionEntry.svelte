<script lang="ts">
    import {
        type ComparisonValueResult,
        formatComparisonNonNumberValues,
        formatComparisonNumberValues
    } from "@perfice/stores/goal/value";
    import {PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import CircularProgressBar from "@perfice/components/base/progress/CircularProgressBar.svelte";
    import {calculateProgressSafe} from "@perfice/util/math";
    import {prettyPrintPrimitive} from "@perfice/model/primitive/primitive.js";

    let {value, color}: { value: ComparisonValueResult, color: string } = $props();

</script>

{#if value.source.type === PrimitiveValueType.NUMBER && value.target.type === PrimitiveValueType.NUMBER}
    <div class="row-between text-sm">
        <div class="row-gap">
            <CircularProgressBar width={30} height={30} strokeWidth={60}
                                 progress={calculateProgressSafe(value.source.value, value.target.value)}
                                 strokeColor={color}/>
            <span class="text-xs">{value.name}</span>
        </div>
        {formatComparisonNumberValues(value.source.value, value.target.value, value.dataType, value.unit)}
    </div>
{:else}
    {prettyPrintPrimitive(value.source)} {value.operator} {prettyPrintPrimitive(value.target)}
    {formatComparisonNonNumberValues(value)}
{/if}

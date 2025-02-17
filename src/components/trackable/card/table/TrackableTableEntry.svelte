<script lang="ts">
    import {
        type DisplayValue, type JournalEntryValue,
        pJournalEntry,
        type PrimitiveValue,
        PrimitiveValueType
    } from "@perfice/model/primitive/primitive";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    import {formatTimestampHHMM} from "@perfice/util/time/format";

    let {value, representation}: {
        value: PrimitiveValue,
        representation: TextOrDynamic[];
    } = $props();

    let entry = $derived<JournalEntryValue>(value.type == PrimitiveValueType.JOURNAL_ENTRY ? value.value : {
        id: "",
        timestamp: 0,
        value: {}
    });

    function getEntryValue(value: JournalEntryValue) {
        let answerMap: Record<string, PrimitiveValue> = value.value;

        let result: string = "";
        for (let rep of representation) {
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
</script>

<div class="w-full border-b row-between px-2">
    <span>
        {getEntryValue(entry)}
    </span>
    <span class="text-xs">
        {formatTimestampHHMM(entry.timestamp)}
    </span>
</div>

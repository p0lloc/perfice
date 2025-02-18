<script lang="ts">
    import {
        type DisplayValue, type JournalEntryValue,
        pJournalEntry,
        type PrimitiveValue,
        PrimitiveValueType
    } from "@perfice/model/primitive/primitive";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    import {formatTimestampHHMM} from "@perfice/util/time/format";
    import {formatEntryIntoRepresentation} from "@perfice/model/trackable/ui";

    let {value, representation}: {
        value: PrimitiveValue,
        representation: TextOrDynamic[];
    } = $props();

    let entry = $derived<JournalEntryValue>(value.type == PrimitiveValueType.JOURNAL_ENTRY ? value.value : {
        id: "",
        timestamp: 0,
        value: {}
    });
</script>

<div class="w-full border-b row-between px-2">
    <span>
        {formatEntryIntoRepresentation(entry, representation)}
    </span>
    <span class="text-xs">
        {formatTimestampHHMM(entry.timestamp)}
    </span>
</div>

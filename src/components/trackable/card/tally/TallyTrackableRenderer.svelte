<script lang="ts">
    import {type JournalEntryValue, type PrimitiveValue, PrimitiveValueType} from "@perfice/model/primitive/primitive";
    import type {Trackable, TrackableValueSettings} from "@perfice/model/trackable/trackable";
    import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {extractValueFromDisplay} from "@perfice/services/variable/types/list.js";
    import {trackables} from "@perfice/stores";

    let {trackable, value, cardSettings, date}: {
        trackable: Trackable,
        value: PrimitiveValue,
        cardSettings: TrackableValueSettings,
        date: Date
    } = $props();

    let entryValue = $derived.by(() => {
        if (value.type != PrimitiveValueType.LIST) return null;

        let values = value.value as PrimitiveValue[];
        if (values.length < 1) return null;

        let first = values[0];
        if (first.type != PrimitiveValueType.JOURNAL_ENTRY) return null;

        return first.value as JournalEntryValue;
    });

    function getTallyValue(entryValue: JournalEntryValue | null): number {
        if (entryValue == null) return 0;

        let values = Object.values(entryValue.value);
        if (values.length < 1) return 0;

        let first = extractValueFromDisplay(values[0]);
        if (first.type != PrimitiveValueType.NUMBER) return 0;

        return first.value;
    }

    function increment() {
        trackables.logTally(trackable, entryValue, true, date);
    }

    function decrement() {
        trackables.logTally(trackable, entryValue, false, date);
    }
</script>

<div class="flex justify-center items-center h-full">
    <button class="tally-btn" onclick={decrement}>
        <Fa icon={faMinus}/>
    </button>
    <span class="text-3xl flex-1">{getTallyValue(entryValue)}</span>
    <button class="tally-btn" onclick={increment}>
        <Fa icon={faPlus}/>
    </button>
</div>

<style>
    .tally-btn {
        @apply pointer-feedback:bg-gray-100 h-full flex items-center justify-center text-2xl;
        flex: 1.5;
    }
</style>

<script lang="ts">
    import {type Trackable, TrackableCardType} from "@perfice/model/trackable/trackable";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {type Component} from "svelte";
    import ChartTrackableRenderer from "@perfice/components/trackable/card/chart/ChartTrackableRenderer.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import ValueTrackableRenderer from "@perfice/components/trackable/card/value/ValueTrackableRenderer.svelte";
    import TallyTrackableRenderer from "@perfice/components/trackable/card/tally/TallyTrackableRenderer.svelte";
    import {trackableValue} from "@perfice/stores";

    let {trackable, date, weekStart, onEdit, onLog, class: className = 'max-h-40 min-h-40'}: {
        trackable: Trackable,
        date: Date,
        weekStart: WeekStart,
        onEdit: () => void
        onLog: () => void,
        class?: string
    } = $props();

    let res = $derived(trackableValue(trackable, date, weekStart, trackable.id));

    let CARD_TYPE_RENDERERS: Record<TrackableCardType, Component<{
        value: PrimitiveValue,
        cardSettings: any,
        trackable: Trackable,
        date: Date
    }>> = {
        [TrackableCardType.CHART]: ChartTrackableRenderer,
        [TrackableCardType.VALUE]: ValueTrackableRenderer,
        [TrackableCardType.TALLY]: TallyTrackableRenderer,
    }

    function onEditClick() {
        onEdit();
    }

    function onInnerClick() {
        // Tally has custom logging logic
        if (trackable.cardType == TrackableCardType.TALLY) return;

        onLog();
    }

    const RendererComponent = $derived(CARD_TYPE_RENDERERS[trackable.cardType]);
</script>


<div class="w-full h-full p-0 bg-white border rounded-xl flex flex-col items-stretch text-gray-500 {className}">
    <button class="border-b rounded-t-xl p-2 flex gap-1 items-center hover-feedback overflow-hidden text-ellipsis"
            onclick={onEditClick}>
        <Icon name={trackable.icon} class="text-green-500 text-xl"/>
        <span class="text-left font-semibold text-gray-700 overflow-hidden text-ellipsis">{trackable.name}</span>
    </button>

    {#await $res}
        Loading...
    {:then value}
        {#if value != null}
            <button class="interactive flex-1 overflow-y-scroll scrollbar-hide" onclick={onInnerClick}>
                <RendererComponent value={value} cardSettings={trackable.cardSettings} date={date} {trackable}/>
            </button>
        {/if}
    {/await}
</div>

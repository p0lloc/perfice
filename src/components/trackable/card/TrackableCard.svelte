<script lang="ts">
    import {type Trackable, TrackableCardType} from "@perfice/model/trackable/trackable";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {trackableValue} from "@perfice/main";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {type Component} from "svelte";
    import ChartTrackableRenderer from "@perfice/components/trackable/card/ChartTrackableRenderer.svelte";
    import TableTrackableRenderer from "@perfice/components/trackable/card/TableTrackableRenderer.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faHamburger} from "@fortawesome/free-solid-svg-icons";
    import Icon from "@perfice/components/base/icon/Icon.svelte";

    let {trackable, date, weekStart, onEdit, onLog}: {
        trackable: Trackable,
        date: Date,
        weekStart: WeekStart,
        onEdit: () => void
        onLog: () => void
    } = $props();

    let res = $derived(trackableValue(trackable, date, weekStart, trackable.id));

    let CARD_TYPE_RENDERERS: Record<TrackableCardType, Component<{ value: PrimitiveValue, cardSettings: any }>> = {
        "CHART": ChartTrackableRenderer,
        "VALUE": TableTrackableRenderer,
    }

    function onEditClick(){
        onEdit();
    }

    const RendererComponent = $derived(CARD_TYPE_RENDERERS[trackable.cardType]);
</script>


<div class="w-full h-full p-0 bg-white border rounded-xl flex flex-col items-stretch min-h-40 max-h-40 text-gray-500">
    <button class="border-b rounded-t-xl p-2 flex gap-2 items-center hover-feedback"
            onclick={onEditClick}>
        <Icon name={trackable.icon} class="text-green-500"/>
        <p class="text-left font-semibold text-gray-700">{trackable.name}</p>
    </button>

    {#await $res}
        Loading...
    {:then value}
        <button class="interactive flex-1 overflow-y-scroll scrollbar-hide" onclick={onLog}>
            <RendererComponent value={value} cardSettings={trackable.cardSettings}/>
        </button>
    {/await}
</div>

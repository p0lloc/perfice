<script lang="ts">
    import {type Trackable, TrackableCardType} from "@perfice/model/trackable/trackable";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {forms, trackableValue} from "@perfice/main";
    import {type PrimitiveValue} from "@perfice/model/primitive/primitive";
    import {type Component, onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";
    import ChartTrackableRenderer from "@perfice/components/trackable/card/ChartTrackableRenderer.svelte";
    import TableTrackableRenderer from "@perfice/components/trackable/card/TableTrackableRenderer.svelte";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faHamburger} from "@fortawesome/free-solid-svg-icons";

    let {trackable, date, weekStart}: { trackable: Trackable, date: Date, weekStart: WeekStart } = $props();

    let cardId = crypto.randomUUID();
    let res = $derived(trackableValue(trackable, date, weekStart, cardId));

    let formModal: FormModal;


    let CARD_TYPE_RENDERERS: Record<TrackableCardType, Component<{ value: PrimitiveValue }>> = {
        "CHART": ChartTrackableRenderer,
        "VALUE": TableTrackableRenderer,
    }

    async function onEdit() {
    }

    async function onLog() {
        let form = await forms.getFormById(trackable.formId);
        if (form == undefined) return;
        formModal.open(form, date);
    }

    onDestroy(() => disposeCachedStoreKey(cardId));

    const RendererComponent = $derived(CARD_TYPE_RENDERERS[trackable.cardType]);
</script>

<FormModal bind:this={formModal}/>
<div class="p-0 bg-white border rounded-xl  flex flex-col items-stretch min-h-40 max-h-40 text-gray-500">
    <button class="border-b p-2 flex gap-2 items-center hover:bg-gray-100 active:bg-gray-100" onclick={onEdit}>
        <Fa icon={faHamburger} class="text-green-500"/>
        <p class="text-left font-semibold text-gray-700">{trackable.name}</p>
    </button>

    {#await $res}
        Loading...
    {:then value}
        <button class="flex-1 overflow-y-scroll scrollbar-hide" onclick={onLog}>
            <RendererComponent value={value}/>
        </button>
    {/await}
</div>

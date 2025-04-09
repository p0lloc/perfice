<script lang="ts">
    import {type EditTrackableState, getDefaultTrackableCardState} from "@perfice/model/trackable/ui";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import {faChartLine, faDiamond, faListNumeric, faPlusMinus} from "@fortawesome/free-solid-svg-icons";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {TrackableCardType} from "@perfice/model/trackable/trackable";
    import type {FormQuestion} from "@perfice/model/form/form";
    import EditTrackableChartCard
        from "@perfice/components/trackable/modals/edit/general/chart/EditTrackableChartCard.svelte";
    import type {Component} from "svelte";
    import EditTrackableValueCard
        from "@perfice/components/trackable/modals/edit/general/value/EditTrackableValueCard.svelte";
    import EditTrackableTallyCard
        from "@perfice/components/trackable/modals/edit/general/tally/EditTrackableTallyCard.svelte";

    const CARD_TYPES = [
        {value: TrackableCardType.CHART, name: "Chart", icon: faChartLine},
        {value: TrackableCardType.VALUE, name: "Value", icon: faListNumeric},
        {value: TrackableCardType.TALLY, name: "Tally", icon: faPlusMinus}
    ];

    let {editState = $bindable(), availableQuestions}: {
        editState: EditTrackableState,
        availableQuestions: FormQuestion[]
    } = $props();

    function onCardTypeChange(e: TrackableCardType) {
        editState.trackable = {...editState.trackable, ...getDefaultTrackableCardState(e, availableQuestions)};
    }

    function getCardSettingsRenderer(cardType: TrackableCardType): Component<{
        cardSettings: any,
        availableQuestions: FormQuestion[],
        onChange: (settings: any) => void
    }> | null {
        switch (cardType) {
            case TrackableCardType.CHART:
                return EditTrackableChartCard;
            case TrackableCardType.VALUE:
                return EditTrackableValueCard;
            case TrackableCardType.TALLY:
                return EditTrackableTallyCard;
        }
    }

    function onCardSettingsChange(settings: any) {
        editState.trackable.cardSettings = settings;
    }

    let RendererComponent = $derived(getCardSettingsRenderer(editState.trackable.cardType));
</script>

<IconLabelBetween title="Card type" icon={faDiamond}>
    <BindableDropdownButton value={editState.trackable.cardType}
                            onChange={onCardTypeChange}
                            items={CARD_TYPES}/>
</IconLabelBetween>

{#if RendererComponent != null}
    <hr class="mt-4">
    <RendererComponent cardSettings={editState.trackable.cardSettings}
                       availableQuestions={availableQuestions} onChange={onCardSettingsChange}/>
{/if}

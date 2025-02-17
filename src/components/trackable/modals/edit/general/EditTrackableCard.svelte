<script lang="ts">
    import type {EditTrackableCardState} from "@perfice/model/trackable/ui";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import {faDiamond} from "@fortawesome/free-solid-svg-icons";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {TrackableCardType} from "@perfice/model/trackable/trackable";
    import {AggregateType} from "@perfice/services/variable/types/aggregate";
    import type {FormQuestion} from "@perfice/model/form/form";
    import EditTrackableChartCard from "@perfice/components/trackable/modals/edit/general/chart/EditTrackableChartCard.svelte";
    import type {Component} from "svelte";
    import EditTrackableValueCard from "@perfice/components/trackable/modals/edit/general/value/EditTrackableValueCard.svelte";

    const CARD_TYPES = [
        {value: TrackableCardType.CHART, name: "Chart"},
        {value: TrackableCardType.VALUE, name: "Value"}
    ];

    let {cardState = $bindable(), availableQuestions}: {
        cardState: EditTrackableCardState,
        availableQuestions: FormQuestion[]
    } = $props();

    function onCardTypeChange(e: TrackableCardType) {
        switch (e) {
            // TODO: move default settings somewhere else
            case TrackableCardType.CHART:
                cardState = {
                    cardType: TrackableCardType.CHART,
                    cardSettings: {
                        aggregateType: AggregateType.SUM,
                        field: availableQuestions.length > 0 ? availableQuestions[0].id : "",
                        color: "#ff0000"
                    }
                };
                break;
            case TrackableCardType.VALUE:
                cardState = {
                    cardType: TrackableCardType.VALUE,
                    cardSettings: {
                        // If there are no questions, we need to create a dummy representation
                        representation: availableQuestions.length > 0 ? [
                            {dynamic: true, value: availableQuestions[0].id}
                        ] : [
                            {dynamic: false, value: ""}
                        ]
                    }
                };
                break;
        }
    }

    function getCardSettingsRenderer(cardType: TrackableCardType): Component<{
        cardSettings: any,
        availableQuestions: FormQuestion[]
    }> | null {
        switch (cardType) {
            case TrackableCardType.CHART:
                return EditTrackableChartCard;
            case TrackableCardType.VALUE:
                return EditTrackableValueCard;
        }
    }

    let RendererComponent = $derived(getCardSettingsRenderer(cardState.cardType));
</script>

<IconLabel title="Card type" icon={faDiamond}>
    <BindableDropdownButton value={cardState.cardType}
                            onChange={onCardTypeChange}
                            items={CARD_TYPES}/>
</IconLabel>

{#if RendererComponent != null}
    <hr class="mt-4">
    <RendererComponent bind:cardSettings={cardState.cardSettings} availableQuestions={availableQuestions}/>
{/if}

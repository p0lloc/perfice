<script lang="ts">
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import {faBrush, faCalculator, faQuestion} from "@fortawesome/free-solid-svg-icons";
    import type {EditTrackableChartSettings} from "@perfice/model/trackable/ui";
    import type {FormQuestion} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {AggregateType} from "@perfice/services/variable/types/aggregate";

    let {cardSettings, availableQuestions}: {
        cardSettings: EditTrackableChartSettings,
        availableQuestions: FormQuestion[]
    } = $props();

    const AGGREGATE_TYPES = [
        {value: AggregateType.SUM, name: "Sum"},
        {value: AggregateType.MEAN, name: "Average"},
    ];

    let questions = $derived(availableQuestions.map(v => {
        return {
            name: v.name,
            value: v.id,
        }
    }));

    function onColorChange(e: Event & {currentTarget: HTMLInputElement}) {
        cardSettings.color = e.currentTarget.value;
    }
</script>
<IconLabel title="Color" icon={faBrush}>
    <input type="color" value={cardSettings.color} onchange={onColorChange} class="w-10 h-10 rounded-md"/>
</IconLabel>
<IconLabel title="Aggregation type" icon={faCalculator}>
    <BindableDropdownButton value={cardSettings.aggregateType}
                            onChange={(v) => cardSettings.aggregateType = v}
                            items={AGGREGATE_TYPES}/>
</IconLabel>
<IconLabel title="Aggregation question" icon={faQuestion}>
    <BindableDropdownButton value={cardSettings.field}
                            onChange={(v) => cardSettings.field = v}
                            items={questions}/>
</IconLabel>

<script lang="ts">
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import {faBrush, faCalculator, faQuestion} from "@fortawesome/free-solid-svg-icons";
    import type {FormQuestion} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {AggregateType} from "@perfice/services/variable/types/aggregate";
    import type {TrackableChartSettings} from "@perfice/model/trackable/trackable";

    let {cardSettings, availableQuestions, onChange}: {
        cardSettings: TrackableChartSettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
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

    function onColorChange(e: Event & { currentTarget: HTMLInputElement }) {
        onChange({
            ...cardSettings,
            color: e.currentTarget.value
        })
    }
</script>
<IconLabelBetween title="Color" icon={faBrush}>
    <input type="color" value={cardSettings.color} onchange={onColorChange} class="w-10 h-10 rounded-md"/>
</IconLabelBetween>
<IconLabelBetween title="Aggregation type" icon={faCalculator}>
    <BindableDropdownButton value={cardSettings.aggregateType}
                            onChange={(v) => cardSettings.aggregateType = v}
                            items={AGGREGATE_TYPES}/>
</IconLabelBetween>
<IconLabelBetween title="Aggregation question" icon={faQuestion}>
    <BindableDropdownButton value={cardSettings.field}
                            onChange={(v) => cardSettings.field = v}
                            items={questions}/>
</IconLabelBetween>

<script lang="ts">
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import {faCalculator} from "@fortawesome/free-solid-svg-icons";
    import type {EditTrackableChartSettings} from "@perfice/model/trackable/ui";
    import type {FormQuestion} from "@perfice/model/form/form";
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import {AggregateType} from "@perfice/services/variable/types/aggregate";

    let {cardSettings, availableQuestions}: {
        cardSettings: EditTrackableChartSettings,
        availableQuestions: FormQuestion[]
    } = $props();

    const AGGREGATE_TYPES = [
        {value: AggregateType.SUM, name: "Sum", icon: null},
        {value: AggregateType.MEAN, name: "Average", icon: null},
    ];
</script>
<IconLabel title="Aggregation type" icon={faCalculator}>
    <BindableDropdownButton value={cardSettings.aggregateType}
                            onChange={(v) => cardSettings.aggregateType = v}
                            items={AGGREGATE_TYPES}/>
</IconLabel>
<IconLabel title="Aggregation question" icon={faCalculator}>
    <BindableDropdownButton value={cardSettings.field}
                            onChange={(v) => cardSettings.field = v}
                            items={availableQuestions.map(v => {
                                    return {
                                        name: v.name,
                                        value: v.id,
                                        icon: null
                                    }
                                })}/>
</IconLabel>

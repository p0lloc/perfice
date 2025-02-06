import {AggregateType} from "@perfice/services/variable/types/aggregate";
import {faDivide, faPlus} from "@fortawesome/free-solid-svg-icons";

export const AGGREGATE_TYPES = [
    {
        value: AggregateType.SUM,
        name: "Sum",
        icon: faPlus
    },
    {
        value: AggregateType.MEAN,
        name: "Average",
        icon: faDivide
    }
]

import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface SegmentedItem<T> {
    name: string;
    value?: T;
    prefix?: IconDefinition;
    suffix?: IconDefinition;
    onClick?: () => void;
}

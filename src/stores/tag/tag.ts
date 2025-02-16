import {writable, type Writable} from "svelte/store";
import {dateToMidnight} from "@perfice/util/time/simple";

export function TagDate(): Writable<Date> {
    return writable(dateToMidnight(new Date()));
}

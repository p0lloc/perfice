import {CustomStore} from "@perfice/stores/store";
import {WeekStart} from "@perfice/model/variable/time/time";

const WEEK_START_STORAGE_KEY = "week_start";

export function loadStoredWeekStart(): WeekStart {
    let weekStartStr = localStorage.getItem(WEEK_START_STORAGE_KEY);
    if (weekStartStr != null) {
        let value = parseInt(weekStartStr);
        if (isFinite(value)) {
            return value as WeekStart;
        }
    }

    let defaultValue = WeekStart.MONDAY;
    localStorage.setItem(WEEK_START_STORAGE_KEY, defaultValue.toString());
    return defaultValue;
}

export type WeekStartObserver = (weekStart: WeekStart) => void;

export class WeekStartStore extends CustomStore<WeekStart> {

    private observers: WeekStartObserver[] = [];

    constructor(weekStart: WeekStart) {
        super(weekStart);
    }

    setWeekStart(weekStart: WeekStart) {
        this.set(weekStart);
        localStorage.setItem(WEEK_START_STORAGE_KEY, weekStart.toString());
        this.observers.forEach(o => o(weekStart));
    }

    addObserver(observer: WeekStartObserver) {
        this.observers.push(observer);
    }

}
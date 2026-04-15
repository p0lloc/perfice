import type {JournalEntry} from "@perfice/model/journal/journal";
import type {RestDay} from "@perfice/model/sport/restday";

function toDateString(date: Date): string {
    let y = date.getFullYear();
    let m = String(date.getMonth() + 1).padStart(2, '0');
    let d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const MAX_LOOKBACK_DAYS = 365;

export class SportStreakService {

    calculateStreak(
        sportEntries: JournalEntry[],
        restDays: RestDay[],
        today: Date
    ): number {
        // Build sets for O(1) lookups by date string
        let entryDates = new Set<string>();
        for (let entry of sportEntries) {
            entryDates.add(toDateString(new Date(entry.timestamp)));
        }

        let restDayDates = new Set<string>();
        for (let rd of restDays) {
            restDayDates.add(rd.date);
        }

        let todayStr = toDateString(today);
        let streak = entryDates.has(todayStr) ? 1 : 0;
        let current = addDays(today, -1);

        // Walk backwards with bounded iteration
        for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
            let dateStr = toDateString(current);
            let hasEntry = entryDates.has(dateStr);
            let isRest = restDayDates.has(dateStr);

            if (hasEntry) {
                // Sport entry on this day (takes precedence over rest day)
                streak++;
            } else if (isRest) {
                // Rest day without entry — preserves streak but doesn't increment
                // Continue walking
            } else {
                // Neither entry nor rest — streak breaks
                break;
            }

            current = addDays(current, -1);
        }

        return streak;
    }
}

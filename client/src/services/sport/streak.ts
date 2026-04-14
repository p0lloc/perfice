import type {JournalEntry} from "@perfice/model/journal/journal";
import type {RestDay} from "@perfice/model/sport/restday";

function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

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
        let streak = 0;
        let current: Date;

        if (entryDates.has(todayStr)) {
            // Today has an entry — count it and start walking from yesterday
            streak = 1;
            current = addDays(today, -1);
        } else if (restDayDates.has(todayStr) && !entryDates.has(todayStr)) {
            // Today is rest day (no entry) — preserve, start from yesterday
            current = addDays(today, -1);
        } else {
            // Today pending — start from yesterday
            current = addDays(today, -1);
        }

        // Walk backwards
        while (true) {
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

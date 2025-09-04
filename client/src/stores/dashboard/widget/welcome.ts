import quotesUrl from '/quotes.json?url';

const quotesStr = await fetch(quotesUrl).then(r => r.text());
export const quotes = JSON.parse(quotesStr);

export function fetchRandomQuote(): string {
    return quotes[Math.floor(Math.random() * quotes.length)].quote;
}


export function getTimeOfDayText(): string {
    const now = new Date();
    if (now.getHours() >= 0 && now.getHours() < 6) return "night";
    if (now.getHours() >= 6 && now.getHours() < 13) return "morning";
    if (now.getHours() >= 13 && now.getHours() < 17) return "afternoon";
    return "evening";
}

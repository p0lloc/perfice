import {parseJsonFromLocalStorage} from "@perfice/util/local";

interface PerfEntry<D> {
    data: D;
    time: number;
}

let perf = parseJsonFromLocalStorage<PerfEntry<any>[]>("perf") ?? [];

export function getPerfSummary() {
    let top = perf.sort((a, b) => b.time - a.time).slice(0, 10);
    return top.map(e => `${e.data}: ${e.time}ms`).join("\n");
}

export function debugPerformance<T, D>(data: D, callback: () => T): T {
    let start = performance.now();
    let value = callback();
    let time = performance.now() - start;

    perf.push({
        data,
        time
    });

    localStorage.setItem("perf", JSON.stringify(perf));
    return value;
}
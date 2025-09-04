export function emptyPromise<T>(): Promise<T> {
    return new Promise<T>((_) => {
    });
}

export function resolvedPromise<T>(v: T): Promise<T> {
    return new Promise<T>((resolve) => resolve(v));
}

export function resolvedUpdatePromise<T>(promise: Promise<T>, updater: (v: T) => T): Promise<T> {
    return new Promise<T>(async (resolve) => {
        let existing = await promise;
        resolve(updater(existing));
    });
}

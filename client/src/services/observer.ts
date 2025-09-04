
export enum EntityObserverType {
    CREATED,
    UPDATED,
    DELETED,
    ANY,
}

export type EntityObserverCallback<T> = (e: T) => Promise<void>;
export interface EntityObserver<T> {
    type: EntityObserverType;
    callback: EntityObserverCallback<T>;
}

export class EntityObservers<T> {
    private observers: EntityObserver<T>[] = [];

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<T>) {
        this.observers.push({ type, callback });
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<T>) {
        this.observers = this.observers.filter(o => o.type != type || o.callback != callback);
    }

    async notifyObservers(type: EntityObserverType, entity: T) {
        let observers = this.observers
            .filter(o => o.type == EntityObserverType.ANY || o.type == type);

        for (const observer of observers) {
            await observer.callback(entity);
        }
    }
}

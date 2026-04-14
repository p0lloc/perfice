import type {RestDayCollection} from "@perfice/db/collections";
import type {RestDay} from "@perfice/model/sport/restday";
import {EntityObserverType, EntityObservers} from "@perfice/services/observer";

export class RestDayService {
    private collection: RestDayCollection;
    private observers: EntityObservers<RestDay> = new EntityObservers();

    constructor(collection: RestDayCollection) {
        this.collection = collection;
    }

    async toggle(date: string): Promise<void> {
        let existing = await this.collection.getRestDayByDate(date);
        if (existing) {
            await this.collection.deleteRestDayByDate(date);
            await this.observers.notifyObservers(EntityObserverType.DELETED, existing);
        } else {
            let restDay: RestDay = {
                id: crypto.randomUUID(),
                date,
                timestamp: Date.now()
            };
            await this.collection.createRestDay(restDay);
            await this.observers.notifyObservers(EntityObserverType.CREATED, restDay);
        }
    }

    async isRestDay(date: string): Promise<boolean> {
        let existing = await this.collection.getRestDayByDate(date);
        return existing != undefined;
    }

    async getRestDaysInRange(startDate: string, endDate: string): Promise<RestDay[]> {
        return this.collection.getRestDaysByDateRange(startDate, endDate);
    }

    async getRestDays(): Promise<RestDay[]> {
        return this.collection.getRestDays();
    }

    addObserver(type: EntityObserverType, callback: (e: RestDay) => Promise<void>): void {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: (e: RestDay) => Promise<void>): void {
        this.observers.removeObserver(type, callback);
    }

    async notifyObservers(type: EntityObserverType, restDay: RestDay): Promise<void> {
        await this.observers.notifyObservers(type, restDay);
    }
}

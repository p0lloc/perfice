import type {RestDay} from "@perfice/model/sport/restday";
import {AsyncStore} from "../store";
import type {RestDayService} from "@perfice/services/sport/restday";
import {deleteIdentifiedInArray} from "@perfice/util/array";
import {EntityObserverType} from "@perfice/services/observer";
import {resolvedPromise} from "@perfice/util/promise";

export class RestDayStore extends AsyncStore<RestDay[]> {

    private restDayService: RestDayService;

    constructor(restDayService: RestDayService) {
        super(resolvedPromise([]));
        this.restDayService = restDayService;

        this.restDayService.addObserver(EntityObserverType.CREATED, async (r) => await this.onRestDayCreated(r));
        this.restDayService.addObserver(EntityObserverType.DELETED, async (r) => await this.onRestDayDeleted(r));
    }

    load() {
        this.set(this.restDayService.getRestDays());
    }

    async toggle(date: string): Promise<void> {
        await this.restDayService.toggle(date);
    }

    async getRestDaysInRange(startDate: string, endDate: string): Promise<RestDay[]> {
        return this.restDayService.getRestDaysInRange(startDate, endDate);
    }

    private async onRestDayCreated(restDay: RestDay) {
        this.updateResolved(v => [...v, restDay]);
    }

    private async onRestDayDeleted(restDay: RestDay) {
        this.updateResolved(v => deleteIdentifiedInArray(v, restDay.id));
    }
}

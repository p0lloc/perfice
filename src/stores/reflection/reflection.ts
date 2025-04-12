import type {ReflectionService} from "@perfice/services/reflection/reflection";
import {AsyncStore} from "@perfice/stores/store";
import {
    type Reflection,
    ReflectionAutoOpenType,
    type ReflectionWidgetAnswerState
} from "@perfice/model/reflection/reflection";
import {resolvedPromise} from "@perfice/util/promise";
import type {StoredNotification} from "@perfice/model/notification/notification";
import {publishToEventStore} from "@perfice/util/event";
import {openReflectionEvents} from "@perfice/model/reflection/ui";
import {isSameDay} from "@perfice/util/time/simple";
import {EntityObserverType} from "@perfice/services/observer";
import {deleteIdentifiedInArray, updateIdentifiedInArray} from "@perfice/util/array";

const REFLECTION_LAST_OPEN_KEY = "last_reflection_auto_open";

export class ReflectionStore extends AsyncStore<Reflection[]> {

    private reflectionService: ReflectionService;
    private lastOpen: number = 0;

    constructor(reflectionService: ReflectionService) {
        super(resolvedPromise([]));
        this.reflectionService = reflectionService;
        this.reflectionService.addObserver(EntityObserverType.CREATED, async (reflection) => await this.onReflectionCreated(reflection));
        this.reflectionService.addObserver(EntityObserverType.UPDATED, async (reflection) => await this.onReflectionUpdated(reflection));
        this.reflectionService.addObserver(EntityObserverType.DELETED, async (reflection) => await this.onReflectionDeleted(reflection));
    }

    load() {
        this.set(this.reflectionService.getReflections());
    }

    async fetchReflectionById(reflectionId: string): Promise<Reflection | undefined> {
        return this.reflectionService.getReflectionById(reflectionId);
    }

    async getNotificationsForReflection(reflectionId: string): Promise<StoredNotification[]> {
        return this.reflectionService.getNotificationsForReflection(reflectionId);
    }

    async createNotification(reflectionId: string, hour: number,
                             minutes: number, weekDay: number | null) {
        return this.reflectionService.createNotificationForReflection(reflectionId, hour, minutes, weekDay);
    }

    async createReflection(value: Reflection) {
        await this.reflectionService.createReflection(value);
    }

    async updateReflection(value: Reflection) {
        await this.reflectionService.updateReflection(value);
    }

    async deleteReflectionById(id: string) {
        await this.reflectionService.deleteReflectionById(id);
    }

    async logReflection(reflection: Reflection, answers: Record<string, ReflectionWidgetAnswerState>, date: Date) {
        await this.reflectionService.logReflection(reflection, answers, date);
    }

    async deleteNotification(id: string) {
        await this.reflectionService.deleteNotification(id);
    }

    async updateNotification(notification: StoredNotification) {
        await this.reflectionService.updateNotification(notification);
    }

    async onNotificationClicked(entityId: string) {
        let reflection = await this.reflectionService.getReflectionById(entityId);
        if (reflection == null) return;

        this.openReflection(reflection);
    }

    private openReflection(reflection: Reflection) {
        if(Date.now() - this.lastOpen < 1000 * 10) return;
        publishToEventStore(openReflectionEvents, reflection);
        this.lastOpen = Date.now();
    }

    private getLastAutoOpen(): number {
        let lastOpen = localStorage.getItem(REFLECTION_LAST_OPEN_KEY);
        if (lastOpen == null) return 0;
        let lastOpenNumber = parseInt(lastOpen);

        if(isNaN(lastOpenNumber)) return 0;
        return lastOpenNumber;
    }

    async onAppOpened() {
        if(isSameDay(new Date(), new Date(this.getLastAutoOpen()))) return;

        let reflections = await this.reflectionService.getReflections();
        let autoOpenReflection = reflections.find(r => r.openType == ReflectionAutoOpenType.DAILY);
        if (autoOpenReflection == null) return;

        this.openReflection(autoOpenReflection);
        localStorage.setItem(REFLECTION_LAST_OPEN_KEY, Date.now().toString());
    }

    private async onReflectionCreated(reflection: Reflection) {
        this.updateResolved(v => [...v, reflection]);
    }

    private async onReflectionUpdated(reflection: Reflection) {
        this.updateResolved(v => updateIdentifiedInArray(v, reflection));
    }

    private async onReflectionDeleted(reflection: Reflection) {
        this.updateResolved(v => deleteIdentifiedInArray(v, reflection.id));
    }

}

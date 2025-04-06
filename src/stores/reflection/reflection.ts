import type {ReflectionService} from "@perfice/services/reflection/reflection";
import {AsyncStore} from "@perfice/stores/store";
import type {Reflection, ReflectionWidgetAnswerState} from "@perfice/model/reflection/reflection";
import {resolvedPromise} from "@perfice/util/promise";
import type {StoredNotification} from "@perfice/model/notification/notification";

export class ReflectionStore extends AsyncStore<Reflection[]> {

    private reflectionService: ReflectionService;

    constructor(reflectionService: ReflectionService) {
        super(resolvedPromise([]));
        this.reflectionService = reflectionService;
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

    async logReflection(reflection: Reflection, answers: Record<string, ReflectionWidgetAnswerState>) {
        await this.reflectionService.logReflection(reflection, answers);
    }

    async deleteNotification(id: string) {
        await this.reflectionService.deleteNotification(id);
    }

    async updateNotification(notification: StoredNotification) {
        await this.reflectionService.updateNotification(notification);
    }
}

import type {ReflectionService} from "@perfice/services/reflection/reflection";
import {AsyncStore} from "@perfice/stores/store";
import type {Reflection} from "@perfice/model/reflection/reflection";
import {resolvedPromise} from "@perfice/util/promise";

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

    async createReflection(value: Reflection) {
        await this.reflectionService.createReflection(value);
    }

    async updateReflection(value: Reflection) {
        await this.reflectionService.updateReflection(value);
    }

    async deleteReflectionById(id: string) {
        await this.reflectionService.deleteReflectionById(id);
    }

}

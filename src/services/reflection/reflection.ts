import type {ReflectionCollection} from "@perfice/db/collections";
import type {Reflection} from "@perfice/model/reflection/reflection";

export class ReflectionService {

    private reflectionCollection: ReflectionCollection;

    constructor(reflectionCollection: ReflectionCollection) {
        this.reflectionCollection = reflectionCollection;
    }

    async getReflections(): Promise<Reflection[]> {
        return this.reflectionCollection.getReflections();
    }

    async getReflectionById(id: string): Promise<Reflection | undefined> {
        return this.reflectionCollection.getReflectionById(id);
    }

    async createReflection(reflection: Reflection): Promise<void> {
        return this.reflectionCollection.createReflection(reflection);
    }

    async updateReflection(reflection: Reflection): Promise<void> {
        return this.reflectionCollection.updateReflection(reflection);
    }

    async deleteReflectionById(id: string): Promise<void> {
        return this.reflectionCollection.deleteReflectionById(id);
    }

}
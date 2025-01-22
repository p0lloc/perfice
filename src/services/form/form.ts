import type {FormCollection} from "@perfice/db/collections";
import type {Form} from "@perfice/model/form/form";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";

export class FormService {

    private collection: FormCollection;
    private observers: EntityObservers<Form> = new EntityObservers();

    constructor(collection: FormCollection) {
        this.collection = collection;
    }

    async getForms(): Promise<Form[]> {
        return this.collection.getForms();
    }

    async getFormById(id: string): Promise<Form | undefined> {
        return this.collection.getFormById(id);
    }

    async createForm(form: Form): Promise<void> {
        await this.collection.createForm(form);
        await this.observers.notifyObservers(EntityObserverType.CREATED, form);
    }

    async updateForm(form: Form): Promise<void> {
        await this.collection.updateForm(form);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, form);
    }

    async deleteFormById(id: string): Promise<void> {
        let form = await this.collection.getFormById(id);
        if (form == undefined) return;
        await this.collection.deleteFormById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, form);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>) {
        this.observers.removeObserver(type, callback);
    }

}

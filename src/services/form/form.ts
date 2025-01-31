import type {FormCollection, FormSnapshotCollection} from "@perfice/db/collections";
import type {Form, FormSnapshot} from "@perfice/model/form/form";
import {type EntityObserverCallback, EntityObservers, EntityObserverType} from "@perfice/services/observer";
import type {JournalService} from "@perfice/services/journal/journal";

export interface FormService {
    initLazyDependencies(journalService: JournalService): void;

    getForms(): Promise<Form[]>;

    getFormById(id: string): Promise<Form | undefined>;

    getFormSnapshotById(id: string): Promise<FormSnapshot | undefined>;

    createForm(form: Form): Promise<void>;

    updateForm(form: Form): Promise<void>;

    deleteFormById(id: string): Promise<void>;

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>): void;

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>): void;
}

export class BaseFormService implements FormService {

    private formCollection: FormCollection;
    private snapshotCollection: FormSnapshotCollection;
    private observers: EntityObservers<Form> = new EntityObservers();

    private journalService!: JournalService;

    constructor(collection: FormCollection, snapshotCollection: FormSnapshotCollection) {
        this.formCollection = collection;
        this.snapshotCollection = snapshotCollection;
    }

    initLazyDependencies(journalService: JournalService) {
        this.journalService = journalService;
    }

    async getForms(): Promise<Form[]> {
        return this.formCollection.getForms();
    }

    async getFormById(id: string): Promise<Form | undefined> {
        return this.formCollection.getFormById(id);
    }

    async getFormSnapshotById(id: string): Promise<FormSnapshot | undefined> {
        return this.snapshotCollection.getFormSnapshotById(id);
    }

    async createForm(form: Form): Promise<void> {
        await this.createSnapshotAndUpdateSnapshotId(form);
        await this.formCollection.createForm(form);
        await this.observers.notifyObservers(EntityObserverType.CREATED, form);
    }

    private async createSnapshotAndUpdateSnapshotId(form: Form): Promise<void> {
        let entriesReferencingSnapshot = true; // If we are creating a new form, we need to create a snapshot regardless
        if (form.snapshotId != "") {
            let entries = await this.journalService.getEntriesBySnapshotId(form.snapshotId);
            entriesReferencingSnapshot = entries.length > 0;
        }

        if (entriesReferencingSnapshot) {
            let snapshot: FormSnapshot = {
                id: crypto.randomUUID(),
                formId: form.id,
                questions: form.questions
            };

            form.snapshotId = snapshot.id;
            await this.snapshotCollection.createFormSnapshot(snapshot);
            return;
        } else {
            // If no entries are referencing this snapshot, we can just update it
            let snapshot = await this.snapshotCollection.getFormSnapshotById(form.snapshotId);
            if (snapshot == null) return;

            snapshot.questions = form.questions;
            await this.snapshotCollection.updateFormSnapshot(snapshot);
        }
    }

    async updateForm(form: Form): Promise<void> {
        await this.createSnapshotAndUpdateSnapshotId(form);
        await this.formCollection.updateForm(form);
        await this.observers.notifyObservers(EntityObserverType.UPDATED, form);
    }

    async deleteFormById(id: string): Promise<void> {
        let form = await this.formCollection.getFormById(id);
        if (form == undefined) return;
        await this.formCollection.deleteFormById(id);
        await this.observers.notifyObservers(EntityObserverType.DELETED, form);
    }

    addObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>) {
        this.observers.addObserver(type, callback);
    }

    removeObserver(type: EntityObserverType, callback: EntityObserverCallback<Form>) {
        this.observers.removeObserver(type, callback);
    }

}

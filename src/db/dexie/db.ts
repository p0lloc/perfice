import Dexie, {type Table} from "dexie";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import type {Form, FormSnapshot, FormTemplate} from "@perfice/model/form/form";
import type {Collections, TrackableCollection, VariableCollection} from "@perfice/db/collections";
import {DexieTrackableCategoryCollection, DexieTrackableCollection} from "@perfice/db/dexie/trackable";
import {DexieVariableCollection} from "@perfice/db/dexie/variable";
import {DexieJournalCollection} from "@perfice/db/dexie/journal";
import {DexieFormCollection, DexieFormSnapshotCollection, DexieFormTemplateCollection} from "@perfice/db/dexie/form";
import {DexieIndexCollection} from "@perfice/db/dexie/index";
import type {Goal} from "@perfice/model/goal/goal";
import {DexieGoalCollection} from "./goal";
import {DexieTagCategoryCollection, DexieTagCollection} from "./tag";
import {DexieTagEntryCollection} from "@perfice/db/dexie/tag";
import type {Tag, TagCategory} from "@perfice/model/tag/tag";

import type {AnalyticsSettings} from "@perfice/model/analytics/analytics";
import {DexieAnalyticsSettingsCollection} from "@perfice/db/dexie/analytics";
import type {Dashboard, DashboardWidget} from "@perfice/model/dashboard/dashboard";
import {DexieDashboardCollection, DexieDashboardWidgetCollection} from "@perfice/db/dexie/dashboard";
import type {Reflection} from "@perfice/model/reflection/reflection";
import {DexieReflectionCollection} from "@perfice/db/dexie/reflection";
import type {JournalSearch} from "@perfice/model/journal/search/search";
import {DexieSavedSearchCollection} from "@perfice/db/dexie/search";
import {DexieNotificationCollection} from "@perfice/db/dexie/notification";
import type {StoredNotification} from "@perfice/model/notification/notification";
import {type Migrator} from "@perfice/db/migration/migration";
import {DexieMigrator} from "@perfice/db/dexie/migration";
import type {EncryptionKey, OutgoingUpdate} from "@perfice/model/sync/sync";
import {DexieEncryptionKeyCollection} from "@perfice/db/dexie/encryption";
import {DexieUpdateQueueCollection} from "@perfice/db/dexie/sync";
import {LazySyncServiceProvider, SyncedTable} from "@perfice/services/sync/sync";

export type DexieDB = Dexie & {
    trackables: Table<Trackable>;
    variables: Table<StoredVariable>;
    entries: Table<JournalEntry>;
    indices: Table<VariableIndex>;
    trackableCategories: Table<TrackableCategory>;
    forms: Table<Form>;
    formSnapshots: Table<FormSnapshot>;
    goals: Table<Goal>;
    tags: Table<Tag>;
    tagEntries: Table<TagEntry>;
    formTemplates: Table<FormTemplate>;
    tagCategories: Table<TagCategory>;
    analyticsSettings: Table<AnalyticsSettings, 'formId'>;
    dashboards: Table<Dashboard>;
    dashboardWidgets: Table<DashboardWidget>;
    reflections: Table<Reflection>;
    savedSearches: Table<JournalSearch>;
    notifications: Table<StoredNotification>;
    encryptionKey: Table<EncryptionKey>;
    updateQueue: Table<OutgoingUpdate>;
};

function loadDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(23).stores({
        "trackables": "id, categoryId",
        "variables": "id",
        "entries": "id, formId, snapshotId, timestamp, integration, [formId+timestamp], [timestamp+id]",
        "indices": "id, variableId, [variableId+timeScope]",
        "trackableCategories": "id",
        "tagCategories": "id",
        "forms": "id",
        "formSnapshots": "id, formId",
        "goals": "id, variableId",
        "tags": "id, categoryId",
        "tagEntries": "id, tagId, timestamp, [tagId+timestamp], [timestamp+id]",
        "formTemplates": "id, formId",
        "analyticsSettings": "formId",
        "dashboards": "id",
        "dashboardWidgets": "id, dashboardId",
        "reflections": "id",
        "savedSearches": "id",
        "notifications": "id, entityId",
        "encryptionKey": "id",
        "updateQueue": "id, entityId, entityType"
    });

    return db;
}

export function setupDb(syncServiceProvider: LazySyncServiceProvider): {
    tables: Record<string, Table>,
    collections: Collections,
    migrator: Migrator
} {
    const db = loadDb();
    const trackableCollection: TrackableCollection = new DexieTrackableCollection(new SyncedTable(db.trackables, "trackables", syncServiceProvider));
    const variableCollection: VariableCollection = new DexieVariableCollection(new SyncedTable(db.variables, "variables", syncServiceProvider));
    const journalCollection = new DexieJournalCollection(new SyncedTable(db.entries, "entries", syncServiceProvider));
    const trackableCategoryCollection = new DexieTrackableCategoryCollection(new SyncedTable(db.trackableCategories, "trackableCategories", syncServiceProvider));
    const formCollection = new DexieFormCollection(new SyncedTable(db.forms, "forms", syncServiceProvider));
    const formSnapshotCollection = new DexieFormSnapshotCollection(new SyncedTable(db.formSnapshots, "formSnapshots", syncServiceProvider));

    const indexCollection = new DexieIndexCollection(new SyncedTable(db.indices, "indices", syncServiceProvider));
    const goalCollection = new DexieGoalCollection(new SyncedTable(db.goals, "goals", syncServiceProvider));

    const tagCollection = new DexieTagCollection(new SyncedTable(db.tags, "tags", syncServiceProvider));
    const tagEntryCollection = new DexieTagEntryCollection(new SyncedTable(db.tagEntries, "tagEntries", syncServiceProvider));

    const formTemplateCollection = new DexieFormTemplateCollection(new SyncedTable(db.formTemplates, "formTemplates", syncServiceProvider));
    const tagCategoryCollection = new DexieTagCategoryCollection(new SyncedTable(db.tagCategories, "tagCategories", syncServiceProvider));

    // TODO: Should this be synced?
    const analyticsSettingsCollection = new DexieAnalyticsSettingsCollection(db.analyticsSettings);

    const dashboardCollection = new DexieDashboardCollection(new SyncedTable(db.dashboards, "dashboards", syncServiceProvider));
    const dashboardWidgetCollection = new DexieDashboardWidgetCollection(new SyncedTable(db.dashboardWidgets, "dashboardWidgets", syncServiceProvider));

    const reflectionCollection = new DexieReflectionCollection(new SyncedTable(db.reflections, "reflections", syncServiceProvider));
    const savedSearchCollection = new DexieSavedSearchCollection(new SyncedTable(db.savedSearches, "savedSearches", syncServiceProvider));
    const notificationCollection = new DexieNotificationCollection(new SyncedTable(db.notifications, "notifications", syncServiceProvider));
    const encryptionKeyCollection = new DexieEncryptionKeyCollection(db.encryptionKey);
    const updateQueueCollection = new DexieUpdateQueueCollection(db.updateQueue);

    return {
        tables: db._allTables,
        collections: {
            entries: journalCollection,
            formSnapshots: formSnapshotCollection,
            forms: formCollection,
            indices: indexCollection,
            trackableCategories: trackableCategoryCollection,
            trackables: trackableCollection,
            variables: variableCollection,
            goals: goalCollection,
            tags: tagCollection,
            tagEntries: tagEntryCollection,
            formTemplates: formTemplateCollection,
            tagCategories: tagCategoryCollection,
            analyticsSettings: analyticsSettingsCollection,
            dashboards: dashboardCollection,
            dashboardWidgets: dashboardWidgetCollection,
            reflections: reflectionCollection,
            savedSearches: savedSearchCollection,
            notifications: notificationCollection,
            encryptionKey: encryptionKeyCollection,
            updateQueue: updateQueueCollection,

            transaction: async (table, callback) => {
                await db.transaction('rw', table, callback);
            }
        }, migrator: new DexieMigrator(db)
    };
}


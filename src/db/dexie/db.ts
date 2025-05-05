import Dexie, {type EntityTable, type Table} from "dexie";
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

export type DexieDB = Dexie & {
    trackables: EntityTable<Trackable, 'id'>;
    variables: EntityTable<StoredVariable, 'id'>;
    entries: EntityTable<JournalEntry, 'id'>;
    indices: EntityTable<VariableIndex, 'id'>;
    trackableCategories: EntityTable<TrackableCategory, 'id'>;
    forms: EntityTable<Form, 'id'>;
    formSnapshots: EntityTable<FormSnapshot, 'id'>;
    goals: EntityTable<Goal, 'id'>;
    tags: EntityTable<Tag, 'id'>;
    tagEntries: EntityTable<TagEntry, 'id'>;
    formTemplates: EntityTable<FormTemplate, 'id'>;
    tagCategories: EntityTable<TagCategory, 'id'>;
    analyticsSettings: EntityTable<AnalyticsSettings, 'formId'>;
    dashboards: EntityTable<Dashboard, 'id'>;
    dashboardWidgets: EntityTable<DashboardWidget, 'id'>;
    reflections: EntityTable<Reflection, 'id'>;
    savedSearches: EntityTable<JournalSearch, 'id'>;
    notifications: EntityTable<StoredNotification, 'id'>;
};

function loadDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(20).stores({
        "trackables": "id, categoryId",
        "variables": "id",
        "entries": "id, formId, snapshotId, timestamp, [formId+timestamp], [timestamp+id]",
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
        "notifications": "id, entityId"
    });

    return db;
}

export function setupDb(): { tables: Record<string, Table>, collections: Collections, migrator: Migrator } {
    const db = loadDb();
    const trackableCollection: TrackableCollection = new DexieTrackableCollection(db.trackables);
    const variableCollection: VariableCollection = new DexieVariableCollection(db.variables);
    const journalCollection = new DexieJournalCollection(db.entries);
    const trackableCategoryCollection = new DexieTrackableCategoryCollection(db.trackableCategories);
    const formCollection = new DexieFormCollection(db.forms);
    const formSnapshotCollection = new DexieFormSnapshotCollection(db.formSnapshots);

    const indexCollection = new DexieIndexCollection(db.indices);
    const goalCollection = new DexieGoalCollection(db.goals);

    const tagCollection = new DexieTagCollection(db.tags);
    const tagEntryCollection = new DexieTagEntryCollection(db.tagEntries);

    const formTemplateCollection = new DexieFormTemplateCollection(db.formTemplates);
    const tagCategoryCollection = new DexieTagCategoryCollection(db.tagCategories);
    const analyticsSettingsCollection = new DexieAnalyticsSettingsCollection(db.analyticsSettings);

    const dashboardCollection = new DexieDashboardCollection(db.dashboards);
    const dashboardWidgetCollection = new DexieDashboardWidgetCollection(db.dashboardWidgets);

    const reflectionCollection = new DexieReflectionCollection(db.reflections);
    const savedSearchCollection = new DexieSavedSearchCollection(db.savedSearches);
    const notificationCollection = new DexieNotificationCollection(db.notifications);

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
            notifications: notificationCollection
        }, migrator: new DexieMigrator(db)
    };
}


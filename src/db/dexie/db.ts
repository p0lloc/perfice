import Dexie, {type EntityTable} from "dexie";
import type {Trackable, TrackableCategory} from "@perfice/model/trackable/trackable";
import type {StoredVariable, VariableIndex} from "@perfice/model/variable/variable";
import type {JournalEntry, TagEntry} from "@perfice/model/journal/journal";
import type {Form, FormSnapshot, FormTemplate} from "@perfice/model/form/form";
import type {
    AnalyticsSettingsCollection, DashboardCollection, DashboardWidgetCollection,
    FormCollection,
    FormSnapshotCollection, FormTemplateCollection, GoalCollection,
    IndexCollection,
    JournalCollection, TagCategoryCollection,
    TagCollection, TagEntryCollection,
    TrackableCategoryCollection, TrackableCollection, VariableCollection
} from "@perfice/db/collections";
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

type DexieDB = Dexie & {
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
};

function loadDb(): DexieDB {
    const db = new Dexie('perfice-db') as DexieDB;
    db.version(15).stores({
        "trackables": "id",
        "variables": "id",
        "entries": "id, formId, snapshotId, timestamp, [formId+timestamp], [timestamp+id]",
        "indices": "id, variableId, [variableId+timeScope]",
        "trackableCategories": "id",
        "tagCategories": "id",
        "forms": "id",
        "formSnapshots": "id, formId",
        "goals": "id, variableId",
        "tags": "id",
        "tagEntries": "id, tagId, timestamp, [tagId+timestamp], [timestamp+id]",
        "formTemplates": "id, formId",
        "analyticsSettings": "formId",
        "dashboards": "id",
        "dashboardWidgets": "id, dashboardId",
    });

    return db;
}

export interface Collections {
    entries: JournalCollection;
    formSnapshots: FormSnapshotCollection;
    forms: FormCollection;
    indices: IndexCollection;
    trackableCategories: TrackableCategoryCollection;
    trackables: TrackableCollection;
    variables: VariableCollection;
    goals: GoalCollection;
    tags: TagCollection;
    tagEntries: TagEntryCollection;
    formTemplates: FormTemplateCollection;
    tagCategories: TagCategoryCollection;
    analyticsSettings: AnalyticsSettingsCollection;
    dashboards: DashboardCollection;
    dashboardWidgets: DashboardWidgetCollection;
}

export function setupDb(): Collections {
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

    return {
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
        dashboardWidgets: dashboardWidgetCollection
    };
}


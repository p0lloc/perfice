import type {Migration} from "@perfice/db/migration/migration";

export class ChartTitlesMigration implements Migration {
    async apply(entity: any): Promise<object> {
        if (entity.type != "CHART") {
            return entity;
        }

        return {
            ...entity,
            settings: {
                ...entity.settings,
                title: null
            }
        };
    }

    getEntityType(): string {
        return "dashboardWidgets";
    }

    getVersion(): number {
        return 1;
    }
}
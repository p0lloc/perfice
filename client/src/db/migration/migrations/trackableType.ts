import type {Migration} from "@perfice/db/migration/migration";

export class TrackableTypeMigration implements Migration {
    async apply(entity: any): Promise<object> {
        return {
            ...entity,
            trackableType: entity.trackableType ?? 'regular'
        };
    }

    getEntityType(): string {
        return "trackables";
    }

    getVersion(): number {
        return 4;
    }
}

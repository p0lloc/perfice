import type {Migration} from "../migration";

export class TestMigration implements Migration {
    getEntityType(): string {
        return "test";
    }

    getVersion(): number {
        return 1;
    }

    async apply(entity: object): Promise<object> {
        return entity;
    }
}
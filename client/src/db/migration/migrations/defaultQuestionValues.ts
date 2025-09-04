import type {Migration} from "@perfice/db/migration/migration";
import type {Form} from "@perfice/model/form/form";

export class FormQuestionDefaultValuesMigration implements Migration {
    async apply(entity: Form): Promise<object> {
        return {
            ...entity, questions: entity.questions.map(q => {
                return {
                    ...q,
                    defaultValue: null
                }
            })
        };
    }

    getEntityType(): string {
        return "forms";
    }

    getVersion(): number {
        return 2;
    }
}

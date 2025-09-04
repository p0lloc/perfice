import type {FormTemplateCollection} from "@perfice/db/collections";
import type {FormTemplate} from "@perfice/model/form/form";
import type {PrimitiveValue} from "@perfice/model/primitive/primitive";

export class FormTemplateService {

    private collection: FormTemplateCollection;

    constructor(collection: FormTemplateCollection) {
        this.collection = collection;
    }

    async createTemplate(formId: string, templateName: string, answers: Record<string, PrimitiveValue>) {
        await this.collection.createFormTemplate({
            id: crypto.randomUUID(),
            formId,
            name: templateName,
            answers
        });
    }


    async updateTemplate(template: FormTemplate, templateName: string, answers: Record<string, PrimitiveValue>) {
        await this.collection.updateFormTemplate({
            ...template,
            name: templateName,
            answers
        });
    }

    async getTemplatesByFormId(formId: string): Promise<FormTemplate[]> {
        return this.collection.getTemplatesByFormId(formId);
    }

}

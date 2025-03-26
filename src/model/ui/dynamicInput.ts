export interface DynamicInputEntity {
    id: string;
    type: string;
    name: string;
    fields: DynamicInputField[];
}

export interface DynamicInputField {
    id: string;
    name: string;
    nested?: boolean;
    fields?: DynamicInputField[];
}

export interface DynamicInputAnswer {
    id: string;
    type: string;
    name: string;
    answers: string[];
}

export interface Tag {
    id: string;
    name: string;
    variableId: string;
    categoryId: string | null;
}

export interface TagCategory {
    id: string;
    name: string;
}

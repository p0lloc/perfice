export interface Tag {
    id: string;
    name: string;
    variableId: string;
    categoryId: string | null;
}

export const UNCATEGORIZED_TAG_CATEGORY_ID = "";

export interface TagCategory {
    id: string;
    name: string;
}

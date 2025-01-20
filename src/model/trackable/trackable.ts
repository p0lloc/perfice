export interface Trackable {
    id: string;
    name: string;
    formId: string;
    categoryId: string | null;
}

export interface TrackableCategory {
    id: string;
    name: string;
}

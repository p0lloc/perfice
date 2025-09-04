import type { Form } from "@perfice/model/form/form";
import type { Tag, TagCategory } from "@perfice/model/tag/tag";
import type { Trackable, TrackableCategory } from "@perfice/model/trackable/trackable";

export interface JournalSearchUiDependencies {
    forms: Form[];
    trackables: Trackable[];
    tags: Tag[];
    trackableCategories: TrackableCategory[];
    tagCategories: TagCategory[];
}

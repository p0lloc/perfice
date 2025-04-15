import tagSuggestionsAsset from '@perfice/assets/tag_suggestions.json?raw'

export const TAG_SUGGESTIONS: TagSuggestionGroup[] = JSON.parse(tagSuggestionsAsset);

export interface TagSuggestionGroup {
    name: string;
    suggestions: TagSuggestion[];
}

export type TagSuggestion = {
    name: string;
}
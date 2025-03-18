import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DropdownMenuItemDetails<T> {
    name: string;
    value: T;
    icon?: IconDefinition;
    separated?: boolean;
}

export type DropdownMenuItem<T> = DropdownMenuItemDetails<T> & {
    action?: () => void;
}

export const DROPDOWN_BUTTON_HEIGHT = 40;

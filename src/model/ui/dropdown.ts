import type {IconDefinition} from "@fortawesome/free-solid-svg-icons";

export interface DropdownMenuItemDetails<T> {
    name: string;
    value: T;
    icon: IconDefinition | null;
}

export type DropdownMenuItem<T> = DropdownMenuItemDetails<T> & {
    action: () => void;
}

import Modal from "../../components/base/modal/Modal.svelte";

export enum ModalType {
    CONFIRM_CANCEL,
    CANCEL,
    DELETE_CONFIRM_CANCEL,
    NONE
}

/**
 * List of active modal components currently open
 */
export const modalNavigatorState: Modal[] = [];

/**
 * Returns true if the modal should render the confirm button
 */
export function shouldModalRenderConfirm(e: ModalType) {
    return e != ModalType.CANCEL;
}

/**
 * Returns true if the modal should render the delete button
 */
export function shouldModalRenderDelete(e: ModalType) {
    return e == ModalType.DELETE_CONFIRM_CANCEL;
}

export enum ModalSize {
    SMALL,
    MEDIUM
}

export interface ModalActions {
    onDelete?: () => void
    onConfirm?: () => void
    onClose?: () => void
}

export interface ModalFooterProps {
    confirmText?: string,
    cancelText?: string,
    deleteText?: string,
    type: ModalType,
}

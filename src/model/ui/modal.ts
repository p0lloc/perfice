import Modal from "../../components/base/modal/Modal.svelte";

export enum ModalType {
    CONFIRM_CANCEL,
    CANCEL,
    DELETE_CONFIRM_CANCEL,
    NONE
}

export type CloseCallback = () => void;

/**
 * List of active fullscreen layouts currently open (modals, sidebars etc)
 */
export let closableState: CloseCallback[] = [];

export function clearClosables() {
    closableState = [];
}

export function onClosableClosed(closable: CloseCallback) {
    closableState = closableState.filter(c => c != closable);
}


/**
 * Returns true if the modal should render the confirm button
 */
export function shouldModalRenderConfirm(e: ModalType) {
    return e != ModalType.CANCEL && e != ModalType.NONE;
}

/**
 * Returns true if the modal should render the delete button
 */
export function shouldModalRenderDelete(e: ModalType) {
    return e == ModalType.DELETE_CONFIRM_CANCEL;
}

export enum ModalSize {
    SMALL,
    MEDIUM,
    LARGE
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

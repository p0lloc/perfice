<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import type {Tag, TagCategory} from "@perfice/model/tag/tag";
    import {faBoxesStacked, faFont} from "@fortawesome/free-solid-svg-icons";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {UNCATEGORIZED_NAME} from "@perfice/util/category";

    let {onSave, onDelete, categories}: {
        onSave: (t: Tag) => void,
        onDelete: (t: Tag) => void,
        categories: TagCategory[]
    } = $props();

    let modal: Modal;

    let tag = $state<Tag>({} as Tag);

    export function open(editTag: Tag) {
        tag = editTag;
        modal.open();
    }

    function deleteTag() {
        onDelete(tag);
        modal.close();
    }

    function save() {
        onSave(tag);
        modal.close();
    }

    function onNameChange(e: Event & { currentTarget: HTMLInputElement }) {
        tag.name = e.currentTarget.value;
    }

    function onCategoryChange(categoryId: string | null) {
        tag.categoryId = categoryId;
    }

    let categoryDropdown = $derived([{id: null, name: UNCATEGORIZED_NAME}, ...categories].map(c => {
        return {
            name: c.name,
            value: c.id,
        }
    }));
</script>

<Modal type={ModalType.DELETE_CONFIRM_CANCEL} onDelete={deleteTag} size={ModalSize.SMALL} onConfirm={save}
       title="Edit tag" bind:this={modal}>
    <IconLabelBetween title="Name" icon={faFont}>
        <input type="text" value={tag.name} onchange={onNameChange}/>
    </IconLabelBetween>

    <IconLabelBetween title="Category" icon={faBoxesStacked}>
        <DropdownButton value={tag.categoryId} items={categoryDropdown} onChange={onCategoryChange}/>
    </IconLabelBetween>
</Modal>
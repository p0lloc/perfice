<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalType} from "@perfice/model/ui/modal.js";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {faHashtag, faHatWizard, faListOl} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {TRACKABLE_SUGGESTIONS, type TrackableSuggestion} from "@perfice/model/trackable/suggestions";
    import CreateSingleValueTrackable
        from "@perfice/components/trackable/modals/create/CreateSingleValueTrackable.svelte";
    import type {FormQuestionDataType} from "@perfice/model/form/form";
    import {TRACKABLE_FORM_CATEGORY_DELIM, TRACKABLE_FORM_ENTITY_TYPE} from "@perfice/model/trackable/ui";
    import {NEW_FORM_ROUTE} from "@perfice/model/form/ui";
    import {navigate} from "@perfice/app";

    let modal: Modal;

    let {onSelectSuggestion, onSingleValue}: {
        onSelectSuggestion: (categoryId: string | null, suggestion: TrackableSuggestion) => void
        onSingleValue: (categoryId: string | null, name: string, icon: string, type: FormQuestionDataType) => void
    } = $props();

    let categoryId: string | null = $state("");
    let singleValue = $state(false);

    let singleValueModal: CreateSingleValueTrackable;

    export function open(addCategoryId: string | null) {
        singleValue = false;
        categoryId = addCategoryId;
        modal.open();
    }

    function onSave() {
        let {name, icon, type} = singleValueModal.getData();
        onSingleValue(categoryId, name, icon, type);
        modal.close();
    }

    function createSingleValue() {
        singleValue = true;
    }

    function createForm() {
        let route = `/forms/${NEW_FORM_ROUTE}:${TRACKABLE_FORM_ENTITY_TYPE}`;
        if (categoryId != null)
            route += `${TRACKABLE_FORM_CATEGORY_DELIM}${categoryId}`;

        navigate(route);
    }

    function onSelected(categoryId: string | null, suggestion: TrackableSuggestion) {
        onSelectSuggestion(categoryId, suggestion);
        modal.close();
    }
</script>

<Modal bind:this={modal} title="Create trackable" onConfirm={onSave}
       type={singleValue ? ModalType.CONFIRM_CANCEL : ModalType.CANCEL}>
    <div class="md:max-h-96 overflow-y-scroll scrollbar-hide">
        {#if singleValue}
            <CreateSingleValueTrackable bind:this={singleValueModal}/>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardButton iconClass="w-14" icon={faHashtag} title="Single value"
                            description="A single value such as a number, text, etc"
                            onClick={createSingleValue}/>
                <CardButton iconClass="w-14" icon={faListOl} title="Form"
                            description="A form with multiple questions tracked together"
                            onClick={createForm}/>
            </div>
            <hr class="my-4">
            <div class="row-gap text-2xl mt-8">
                <Fa icon={faHatWizard} class="text-green-500"/>
                <span class="text-gray-500 font-bold">Suggestions</span>
            </div>
            <div class="flex flex-col gap-2 mt-4">
                {#each TRACKABLE_SUGGESTIONS as group}
                    <p class="font-bold text-gray-500 text-xl">{group.name}</p>
                    <div class="grid grid-cols-2 md:grid-cols-4 md:max-w-[75%] gap-2">
                        {#each group.suggestions as suggestion}
                            <button onclick={() => onSelected(categoryId, suggestion)}
                                    class="flex flex-col justify-center rounded-xl items-center gap-2 min-h-28 border hover-feedback">
                                <Icon name={suggestion.icon} class="text-3xl"/>
                                <p>{suggestion.name}</p>
                            </button>
                        {/each}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</Modal>
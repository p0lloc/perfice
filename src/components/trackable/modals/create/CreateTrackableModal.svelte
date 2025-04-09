<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalType} from "@perfice/model/ui/modal.js";
    import CardButton from "@perfice/components/base/button/CardButton.svelte";
    import {faHashtag, faHatWizard, faListOl} from "@fortawesome/free-solid-svg-icons";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import {TRACKABLE_SUGGESTIONS, type TrackableSuggestion} from "@perfice/model/trackable/suggestions";

    let modal: Modal;

    let {onSelect}: { onSelect: (categoryId: string | null, suggestion: TrackableSuggestion) => void } = $props();

    let categoryId: string | null = $state("");

    export function open(addCategoryId: string | null) {
        categoryId = addCategoryId;
        modal.open();
    }

    function onSelected(categoryId: string | null, suggestion: TrackableSuggestion) {
        onSelect(categoryId, suggestion);
        modal.close();
    }
</script>

<Modal bind:this={modal} title="Create trackable" type={ModalType.CANCEL}>
    <div class="md:max-h-96 overflow-y-scroll scrollbar-hide">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardButton iconClass="w-14" icon={faHashtag} class="flex-1" title="Single value"
                        description="A single value such as a number, text, etc"
                        onClick={() => {}}/>
            <CardButton iconClass="w-14" icon={faListOl} class="flex-1" title="Form"
                        description="A form with multiple questions tracked together"
                        onClick={() => {}}/>
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
    </div>
</Modal>
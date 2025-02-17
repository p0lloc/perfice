<script lang="ts">
    import type {EditTrackableValueSettings} from "@perfice/model/trackable/ui";
    import type {FormQuestion} from "@perfice/model/form/form";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import EditTrackableValueRepresentation
        from "@perfice/components/trackable/modals/edit/general/value/EditTrackableValueRepresentation.svelte";
    import type {TextOrDynamic} from "@perfice/model/variable/variable";

    let {cardSettings, availableQuestions}: {
        cardSettings: EditTrackableValueSettings,
        availableQuestions: FormQuestion[]
    } = $props();

    let editMultiple = $state(false);

    let simpleRepresentation = $derived(!editMultiple
        && cardSettings.representation.length === 1
        && cardSettings.representation[0].dynamic);

    function onRepresentationChange(v: TextOrDynamic[]) {
        cardSettings.representation = v;
    }

    function addMultiple() {
        editMultiple = true;
    }
</script>

<div class="flex justify-between flex-wrap gap-2 items-start mt-4">
    <div class="row-gap label">
        <Fa icon={faQuestionCircle}/>

        <div class="flex flex-col items-start"><label for="first_name">Display value</label>
            {#if simpleRepresentation}
                <button onclick={addMultiple} class="text-xs text-gray-400">Add multiple</button>
            {/if}
        </div>
    </div>
    {#if simpleRepresentation}
        <DropdownButton value={cardSettings.representation[0].value} class="w-1/2 md:w-64" items={availableQuestions.map(q => {
            return {
                name: q.name,
                value: q.id,
                action: () => cardSettings.representation[0] = {dynamic: true, value: q.id}
            }
        })}>
        </DropdownButton>
    {:else}
        <EditTrackableValueRepresentation onChange={(v) => onRepresentationChange(v)} representation={cardSettings.representation} {availableQuestions} />
    {/if}
</div>

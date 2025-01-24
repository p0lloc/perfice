<script lang="ts">
    import type {EditTrackableValueSettings} from "@perfice/model/trackable/ui";
    import type {FormQuestion} from "@perfice/model/form/form";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";

    let {cardSettings, availableQuestions}: {
        cardSettings: EditTrackableValueSettings,
        availableQuestions: FormQuestion[]
    } = $props();
</script>

<div class="row-between mt-4">
    <div class="row-gap label">
        <Fa icon={faQuestionCircle}/>

        <div class="flex flex-col items-start"><label for="first_name">Display value</label>
            <button class="text-xs text-gray-400">Add multiple</button>
        </div>
    </div>
    {#if cardSettings.representation.length === 1 && cardSettings.representation[0].dynamic}
        <DropdownButton value={cardSettings.representation[0].value} class="w-1/2 md:w-64" items={availableQuestions.map(q => {
            return {
                icon: null,
                name: q.name,
                value: q.id,
                action: () => cardSettings.representation[0] = {dynamic: true, value: q.id}
            }
        })}>
        </DropdownButton>
    {/if}
</div>

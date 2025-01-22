<script lang="ts">
    import type {Trackable} from "@perfice/model/trackable/trackable";
    import {WeekStart} from "@perfice/model/variable/time/time";
    import {forms, trackableValue} from "@perfice/main";
    import {prettyPrintPrimitive} from "@perfice/model/primitive/primitive";
    import {onDestroy} from "svelte";
    import {disposeCachedStoreKey} from "@perfice/stores/cached";
    import FormModal from "@perfice/components/form/modals/FormModal.svelte";

    let {trackable, date, weekStart}: { trackable: Trackable, date: Date, weekStart: WeekStart } = $props();

    let cardId = crypto.randomUUID();
    let res = $derived(trackableValue(trackable, date, weekStart, cardId));

    let formModal: FormModal;

    async function createEntry() {
        let form = await forms.getFormById(trackable.formId);
        if(form == undefined) return;
        formModal.open(form, date);
    }

    onDestroy(() => disposeCachedStoreKey(cardId));
</script>

<FormModal bind:this={formModal} />
<div class="bg-white p-2 border">
    {trackable.name}

    {#await $res}
        Loading...
    {:then value}
        <div class="border p-2">
            {prettyPrintPrimitive(value)}

            <button onclick={createEntry}>Log</button>
        </div>
    {/await}
</div>

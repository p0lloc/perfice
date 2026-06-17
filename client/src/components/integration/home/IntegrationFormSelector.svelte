<script lang="ts">
    import { faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
    import Button from "@perfice/components/base/button/Button.svelte";
    import Icon from "@perfice/components/base/icon/Icon.svelte";
    import type { Form } from "@perfice/model/form/form";
    import type { Integration } from "@perfice/model/integration/integration";
    import { forms, integrations } from "@perfice/stores";
    import { onMount } from "svelte";
    import Fa from "svelte-fa";

    let {
        select,
        back,
        integrationType,
    }: {
        select: (formId: string, integrationId: string | null) => void;
        back: () => void;
        integrationType: string;
    } = $props();

    onMount(async () => {
        await integrations.load();
    });

    function onSelectForm(form: Form, integrations: Integration[]) {
        select(form.id, getIntegrationByForm(form, integrations)?.id ?? null);
    }

    function getIntegrationByForm(form: Form, integrations: Integration[]) {
        return integrations.find(
            (i) => i.formId == form.id && i.integrationType == integrationType,
        );
    }
</script>

{#await $integrations then integrationData}
    {#await $forms then forms}
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Select trackable</h2>
            <Button onClick={back}>Back</Button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each forms as form (form.id)}
                <button
                    onclick={() =>
                        onSelectForm(form, integrationData.integrations)}
                    class="hover-feedback flex flex-col gap-2 items-center justify-center card px-4 pt-4 pb-6"
                >
                    <div
                        class="flex justify-end items-center w-full text-gray-400"
                    >
                        <Fa
                            icon={getIntegrationByForm(
                                form,
                                integrationData.integrations,
                            ) != null
                                ? faGear
                                : faPlus}
                        />
                    </div>
                    <Icon name={form.icon} />
                    {form.name}
                </button>
            {/each}
        </div>
    {/await}
{/await}

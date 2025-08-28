<script lang="ts">
    import {forms, integrations} from "@perfice/stores";
    import {faGears} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import type {
        Integration,
        IntegrationEntityDefinition,
        IntegrationType
    } from "@perfice/model/integration/integration";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {navigate} from "@perfice/app";
    import {onMount} from "svelte";
    import type {Form} from "@perfice/model/form/form";
    import IntegrationFieldEditor from "@perfice/components/integration/IntegrationFieldEditor.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import IntegrationOptionEditor from "@perfice/components/integration/IntegrationOptionEditor.svelte";
    import GenericInfoModal from "@perfice/components/base/modal/generic/GenericInfoModal.svelte";

    let {integrationId, back}: { integrationId: string, back: () => void } = $props();
    let fetchedHistoricalModal: GenericInfoModal;

    let integrationType: IntegrationType | undefined = $state(undefined);
    let selectedEntity: IntegrationEntityDefinition | undefined = $state<IntegrationEntityDefinition | undefined>(undefined);
    let form: Form | undefined = $state<Form | undefined>(undefined);
    let integration: Integration | undefined = $state<Integration | undefined>(undefined);

    let fieldEditor: IntegrationFieldEditor;
    let optionEditor: IntegrationOptionEditor;
    let deleteModal: GenericDeleteModal<Integration>;

    onMount(async () => {
        let data = await integrations.load();
        integration = data.integrations.find(i => i.id == integrationId);
        if (integration == null) {
            navigate(`/`);
            return;
        }

        let formById = await forms.getFormById(integration.formId);
        let status = await integrations.fetchAuthenticationStatus(integration.integrationType);
        if (!status || !formById) {
            back();
            return;
        }

        integrationType = data.integrationTypes.find(i => i.integrationType == integration!.integrationType);
        if (integration == null || integrationType == null) return;

        selectedEntity = integrationType.entities.find(e => e.entityType == integration!.entityType);
        form = formById;
    });

    function deleteIntegration() {
        deleteModal.open(integration!);
    }

    async function onDelete() {
        await integrations.deleteIntegrationById(integration!.id);
        back();
    }

    async function save() {
        if (integration == null) return;

        let fields = fieldEditor.save();
        let options = optionEditor.save();
        if (options == null) {
            alert("Invalid options");
            return;
        }

        await integrations.updateIntegration(integration.id, fields, options);
        back();
    }

    async function fetchHistorical() {
        await integrations.fetchHistorical(integration!.id);
        fetchedHistoricalModal.open();
    }
</script>

<GenericDeleteModal subject="this integration" {onDelete} bind:this={deleteModal}/>
<GenericInfoModal title="Fetched data" message="Successfully fetched historical data for this integration"
                  bind:this={fetchedHistoricalModal}/>
{#if integrationType && form && integration && selectedEntity}
    <!--    <MobileTopBar title={integrationType.name}>-->
    <!--        {#snippet leading()}-->
    <!--            <button class="icon-button" onclick={back}>-->
    <!--                <Fa icon={faArrowLeft}/>-->
    <!--            </button>-->
    <!--        {/snippet}-->
    <!--        {#snippet actions()}-->
    <!--            <button class="icon-button" onclick={deleteIntegration}>-->
    <!--                <Fa icon={faTrash}/>-->
    <!--            </button>-->
    <!--            <button class="icon-button" onclick={save}>-->
    <!--                <Fa icon={faCheck}/>-->
    <!--            </button>-->
    <!--        {/snippet}-->
    <!--    </MobileTopBar>-->
    <div class="md:mt-8">
        <div class="justify-between flex items-center">
            <Title title={integrationType.name} icon={faGears}/>
            <Button onClick={deleteIntegration} color={ButtonColor.RED} class="md:flex">Delete integration
            </Button>
        </div>
        <IntegrationFieldEditor {form} {selectedEntity} fields={integration.fields} bind:this={fieldEditor}/>
        <IntegrationOptionEditor definition={selectedEntity.options} options={integration.options}
                                 bind:this={optionEditor}/>
        <div class="flex justify-between gap-2 items-center mt-4">
            {#if selectedEntity.historical}
                <Button onClick={fetchHistorical}>Fetch historical</Button>
            {/if}
            <div class="flex gap-2 items-center">
                <Button onClick={save}>Save</Button>
                <Button color={ButtonColor.RED} onClick={back}>Cancel</Button>
            </div>
        </div>
    </div>
{/if}

<script lang="ts">
    import {forms, integrations} from "@perfice/stores";
    import {faArrowLeft, faCheck, faGears, faTrash} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
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

    let {params}: { params: Record<string, string> } = $props();

    let integrationType: IntegrationType | undefined = $state(undefined);
    let selectedEntity: IntegrationEntityDefinition | undefined = $state<IntegrationEntityDefinition | undefined>(undefined);
    let form: Form | undefined = $state<Form | undefined>(undefined);
    let integration: Integration | undefined = $state<Integration | undefined>(undefined);

    let fieldEditor: IntegrationFieldEditor;
    let deleteModal: GenericDeleteModal<Integration>;

    onMount(async () => {
        let data = await integrations.load();
        integration = data.integrations.find(i => i.id == params.integrationId);
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

    function back() {
        navigate(`/integrations/${integration!.formId}`);
    }

    async function onDelete() {
        await integrations.deleteIntegrationById(integration!.id);
        back();
    }

    async function save() {
        if (integration == null) return;

        let fields = fieldEditor.save();

        await integrations.updateIntegration(integration.id, fields);
        back();
    }

    async function fetchHistorical() {
        await integrations.fetchHistorical(integration!.id);
    }
</script>

<GenericDeleteModal subject="this integration" {onDelete} bind:this={deleteModal}/>
{#if integrationType && form && integration && selectedEntity}
    <MobileTopBar title={integrationType.name}>
        {#snippet leading()}
            <button class="icon-button" onclick={back}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            <button class="icon-button" onclick={deleteIntegration}>
                <Fa icon={faTrash}/>
            </button>
            <button class="icon-button" onclick={save}>
                <Fa icon={faCheck}/>
            </button>
        {/snippet}
    </MobileTopBar>
    <div class="center-view md:mt-8 md:p-0 p-2 main-content">
        <div class="justify-between flex items-center">
            <Title title={integrationType.name} icon={faGears}/>
            <Button onClick={deleteIntegration} color={ButtonColor.RED} class="hidden md:flex">Delete integration
            </Button>
        </div>
        <IntegrationFieldEditor {form} {selectedEntity} fields={integration.fields} bind:this={fieldEditor}/>
        <div class="hidden md:flex justify-end gap-2 items-center mt-4">
            <Button onClick={save}>Save</Button>
            <Button color={ButtonColor.RED} onClick={back}>Cancel</Button>
        </div>
        <Button onClick={fetchHistorical}>Fetch historical</Button>
    </div>
{/if}

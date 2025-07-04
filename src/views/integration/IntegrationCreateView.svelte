<script lang="ts">
    import {forms, integrations} from "@perfice/stores";
    import {faArrowLeft, faCheck, faGears} from "@fortawesome/free-solid-svg-icons";
    import Title from "@perfice/components/base/title/Title.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
    import type {IntegrationEntityDefinition, IntegrationType} from "@perfice/model/integration/integration";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {navigate} from "@perfice/app";
    import {onMount} from "svelte";
    import IntegrationEntityCard from "@perfice/components/integration/IntegrationEntityCard.svelte";
    import type {Form} from "@perfice/model/form/form";
    import IntegrationFieldEditor from "@perfice/components/integration/IntegrationFieldEditor.svelte";
    import {ButtonColor} from "@perfice/model/ui/button";
    import Button from "@perfice/components/base/button/Button.svelte";
    import IntegrationOptionEditor from "@perfice/components/integration/IntegrationOptionEditor.svelte";

    let {params}: { params: Record<string, string> } = $props();

    let integrationType: IntegrationType | undefined = $state(undefined);
    let selectedEntity: IntegrationEntityDefinition | undefined = $state<IntegrationEntityDefinition | undefined>(undefined);
    let form: Form | undefined = $state<Form | undefined>(undefined);

    let fieldEditor: IntegrationFieldEditor;
    let optionEditor: IntegrationOptionEditor;

    onMount(async () => {
        let formById = await forms.getFormById(params.formId);
        let status = await integrations.fetchAuthenticationStatus(params.integrationType);
        if (!status || !formById) {
            back();
            return;
        }

        let data = await integrations.load();
        integrationType = data.integrationTypes.find(i => i.integrationType == params.integrationType);
        form = formById;
    });

    function selectEntity(entity: IntegrationEntityDefinition) {
        selectedEntity = entity;
    }

    function back() {
        navigate(`/integrations/${params.formId}`);
    }

    function save() {
        if (selectedEntity == null || form == null) return;

        let fields = fieldEditor.save();
        let options = optionEditor.save();
        if (options == null) {
            alert("Invalid options");
            return;
        }

        integrations.createIntegration(params.integrationType, selectedEntity.entityType, form.id, fields, options);
        back();
    }
</script>

{#if integrationType && form}
    <MobileTopBar title={integrationType.name}>
        {#snippet leading()}
            <button class="icon-button" onclick={back}>
                <Fa icon={faArrowLeft}/>
            </button>
        {/snippet}
        {#snippet actions()}
            {#if selectedEntity}
                <button class="icon-button" onclick={save}>
                    <Fa icon={faCheck}/>
                </button>
            {/if}
        {/snippet}
    </MobileTopBar>
    <div class="center-view md:mt-8 md:p-0 p-2 main-content">
        <Title title={integrationType.name} icon={faGears}/>
        {#if selectedEntity}
            <IntegrationFieldEditor bind:this={fieldEditor} {form} {selectedEntity}/>
            <IntegrationOptionEditor definition={selectedEntity.options} options={{}}
                                     bind:this={optionEditor}/>
            <div class="hidden md:flex justify-end gap-2 items-center mt-4">
                <Button onClick={save}>Save</Button>
                <Button color={ButtonColor.RED} onClick={back}>Cancel</Button>
            </div>
        {:else}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {#each integrationType.entities as entity}
                    <IntegrationEntityCard entity={entity} onClick={() => selectEntity(entity)}/>
                {/each}
            </div>
        {/if}
    </div>
{/if}

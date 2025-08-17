<script lang="ts">
    import type {Component} from "svelte";
    import IntegrationTypesView from "@perfice/views/integration/IntegrationTypesView.svelte";
    import IntegrationCreateView from "@perfice/views/integration/IntegrationCreateView.svelte";
    import IntegrationEditView from "@perfice/views/integration/IntegrationEditView.svelte";

    type ViewData = {
        type: "types",
        formId: string,
        create: (integrationType: string) => void,
        edit: (integrationId: string) => void,
    } | {
        type: "create",
        formId: string,
        integrationTypeId: string,
        back: () => void
    } | {
        type: "edit",
        formId: string,
        integrationId: string,
        back: () => void
    }

    let {formId}: { formId: string } = $props();

    function typesViewData(formId: string): ViewData {
        return {
            type: "types",
            formId: formId,
            create: (integrationType: string) => {
                viewData = {
                    type: "create",
                    formId: formId,
                    integrationTypeId: integrationType,
                    back: () => viewData = typesViewData(formId)
                }
            },
            edit: (integrationId: string) => {
                viewData = {
                    type: "edit",
                    formId: formId,
                    integrationId: integrationId,
                    back: () => viewData = typesViewData(formId)
                }
            }
        };
    }

    let viewData: ViewData = $state<ViewData>(typesViewData(formId));

    const RENDERERS: Record<ViewData["type"], Component<any>> = {
        "types": IntegrationTypesView,
        "create": IntegrationCreateView,
        "edit": IntegrationEditView
    };

    const RendererComponent = $derived(RENDERERS[viewData.type]);
</script>

<RendererComponent {...viewData}/>
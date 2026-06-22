<script lang="ts">
    import type { Component } from "svelte";
    import IntegrationTypesView from "@perfice/views/integration/IntegrationTypesView.svelte";
    import IntegrationCreateView from "@perfice/views/integration/IntegrationCreateView.svelte";
    import IntegrationEditView from "@perfice/views/integration/IntegrationEditView.svelte";
    import IntegrationFormSelector from "@perfice/components/integration/home/IntegrationFormSelector.svelte";

    type EditViewData = {
        type: "edit";
        formId: string;
        integrationId: string;
        back: () => void;
    };

    type CreateViewData = {
        type: "create";
        formId: string;
        integrationTypeId: string;
        back: () => void;
    };

    type ViewData =
        | {
              type: "types";
              formId: string;
              create: (integrationType: string) => void;
              edit: (integrationId: string) => void;
          }
        | CreateViewData
        | EditViewData
        | {
              type: "select";
              integrationType: string;
              select: (formId: string, integrationId: string | null) => void;
              back: () => void;
          };

    let {
        formId,
        hideTitle = false,
    }: { formId: string | null; hideTitle?: boolean } = $props();

    function typesViewData(formId: string | null): ViewData {
        return {
            type: "types",
            formId: formId ?? "",
            create: (integrationType: string) => {
                if (formId != null) {
                    viewData = createViewData(formId, integrationType);
                } else {
                    viewData = {
                        type: "select",
                        integrationType,
                        back: () => (viewData = typesViewData(formId)),
                        select: (formId, integrationId) => {
                            if (integrationId != null) {
                                viewData = editViewData(formId, integrationId);
                            } else {
                                viewData = createViewData(
                                    formId,
                                    integrationType,
                                );
                            }
                        },
                    };
                }
            },
            edit: (integrationId: string) => {
                if (formId == null) return;

                viewData = editViewData(formId, integrationId);
            },
        };
    }

    function createViewData(
        selectedFormId: string,
        integrationType: string,
    ): CreateViewData {
        return {
            type: "create",
            formId: selectedFormId,
            integrationTypeId: integrationType,
            back: () => (viewData = typesViewData(formId)),
        };
    }

    function editViewData(
        selectedFormId: string,
        integrationId: string,
    ): EditViewData {
        return {
            type: "edit",
            formId: selectedFormId,
            integrationId: integrationId,
            back: () => (viewData = typesViewData(formId)),
        };
    }

    let viewData: ViewData = $state<ViewData>(typesViewData(formId));

    const RENDERERS: Record<ViewData["type"], Component<any>> = {
        types: IntegrationTypesView,
        create: IntegrationCreateView,
        edit: IntegrationEditView,
        select: IntegrationFormSelector,
    };

    const RendererComponent = $derived(RENDERERS[viewData.type]);
</script>

<RendererComponent {...viewData} {hideTitle} />

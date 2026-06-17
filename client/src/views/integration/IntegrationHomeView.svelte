<script lang="ts">
    import Title from "@perfice/components/base/title/Title.svelte";
    import { faSquareShareNodes } from "@fortawesome/free-solid-svg-icons";
    import IntegrationEditorView from "./IntegrationEditorView.svelte";
    import MobileTopBar from "@perfice/components/mobile/MobileTopBar.svelte";
</script>

<MobileTopBar title="Integrations" />
<div class="center-view md:mt-8 mt-0 md:p-0 p-2 main-content">
    <Title title="Integrations" icon={faSquareShareNodes} />
    <div class="mt-0 md:mt-4">
        <IntegrationEditorView formId={null} hideTitle={true} />
    </div>
</div>

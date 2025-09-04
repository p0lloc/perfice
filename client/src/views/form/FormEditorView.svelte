<script lang="ts">
    import {type Form,} from "@perfice/model/form/form";
    // noinspection ES6UnusedImports
    import Fa from "svelte-fa";
    import {NEW_FORM_ROUTE} from "@perfice/model/form/ui";
    import {onMount} from "svelte";
    import {forms} from "@perfice/stores";
    import FormEditor from "@perfice/views/form/FormEditor.svelte";

    let {params}: { params: Record<string, string> } = $props();
    let form = $state<Form | undefined>(undefined);

    let creating = $state<string | null>(null);

    async function loadForm() {
        let formId = params.formId;
        if (formId == undefined) return;

        if (formId.startsWith(NEW_FORM_ROUTE)) {
            let parts = formId.split(":");
            if (parts.length != 2) return;

            creating = parts[1];
            form = {
                id: crypto.randomUUID(),
                name: "",
                icon: "",
                snapshotId: crypto.randomUUID(),
                questions: [],
                format: []
            }
        } else {
            form = await forms.getFormById(formId);
        }
    }

    onMount(() => loadForm());
</script>

<div class="mx-auto w-full lg:w-1/2 md:w-3/4 md:mt-8 main-content">
    <FormEditor headless={false} {form} {creating}/>
</div>

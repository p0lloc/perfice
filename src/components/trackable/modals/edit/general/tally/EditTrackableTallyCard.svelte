<script lang="ts">
    import type {
        EditTrackableTallySettings,
    } from "@perfice/model/trackable/ui";
    import type {FormQuestion} from "@perfice/model/form/form";

    let {cardSettings, availableQuestions, onChange}: {
        cardSettings: EditTrackableTallySettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
    } = $props();
</script>

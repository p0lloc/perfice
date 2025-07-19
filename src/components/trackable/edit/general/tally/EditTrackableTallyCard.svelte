<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {TrackableTallySettings} from "@perfice/model/trackable/trackable";

    let {}: {
        cardSettings: TrackableTallySettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
    } = $props();
</script>

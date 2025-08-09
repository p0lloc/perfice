<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {TrackableHabitSettings} from "@perfice/model/trackable/trackable";

    let {cardSettings, onChange, availableQuestions}: {
        cardSettings: TrackableHabitSettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
    } = $props();
</script>

<div class="p-4">There are no settings for this card type.</div>
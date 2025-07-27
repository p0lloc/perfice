<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {TrackableTallySettings} from "@perfice/model/trackable/trackable";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";

    let {cardSettings, onChange, availableQuestions}: {
        cardSettings: TrackableTallySettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
    } = $props();

    let questions = $derived(availableQuestions.map(v => {
        return {
            value: v.id,
            name: v.name
        }
    }));

    function onFieldChange(v: string) {
        onChange({
            ...cardSettings,
            field: v
        });
    }
</script>

<IconLabelBetween title="Question" icon={faQuestionCircle}>
    <DropdownButton value={cardSettings.field} items={questions} onChange={onFieldChange}/>
</IconLabelBetween>

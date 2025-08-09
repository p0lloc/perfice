<script lang="ts">
    import type {FormQuestion} from "@perfice/model/form/form";
    import type {TrackableHabitSettings} from "@perfice/model/trackable/trackable";
    import {faBrush} from "@fortawesome/free-solid-svg-icons";
    import IconLabelBetween from "@perfice/components/base/iconLabel/IconLabelBetween.svelte";
    import ColorPickerButton from "@perfice/components/base/color/ColorPickerButton.svelte";

    let {cardSettings, onChange, availableQuestions}: {
        cardSettings: TrackableHabitSettings,
        availableQuestions: FormQuestion[]
        onChange: (settings: any) => void
    } = $props();

    function onColorChange(v: string) {
        onChange({
            ...cardSettings,
            color: v
        });
    }
</script>

<IconLabelBetween title="Color" icon={faBrush}>
    <ColorPickerButton value={cardSettings.color} onChange={onColorChange}/>
</IconLabelBetween>

<script lang="ts">
    import type {InputFieldProps} from "@perfice/model/form/ui";
    import TimePicker from "@perfice/components/base/timePicker/TimePicker.svelte";

    let {value, onChange, disabled}: InputFieldProps = $props();

</script>

<TimePicker time={value} {onChange} {disabled} />

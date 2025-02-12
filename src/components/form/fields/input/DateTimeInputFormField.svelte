<script lang="ts">
    import type {InputFieldProps} from "@perfice/model/form/ui";
    import DatePicker from "@perfice/components/base/datePicker/DatePicker.svelte";

    let {value, onChange, disabled}: InputFieldProps = $props();

</script>

<DatePicker time={true} {value} {disabled} {onChange} />

<script lang="ts">
    import type {TextOrDynamic} from "@perfice/model/variable/variable";
    import type {FormQuestion} from "@perfice/model/form/form";
    import EditTextOrDynamic from "@perfice/components/base/textOrDynamic/EditTextOrDynamic.svelte";

    let {representation, availableQuestions, onChange}: {
        representation: TextOrDynamic[],
        availableQuestions: FormQuestion[],
        onChange: (v: TextOrDynamic[]) => void
    } = $props();
</script>

<EditTextOrDynamic value={representation} availableDynamic={availableQuestions}
                   {onChange}
                   getDynamicId={(v) => v.id}
                   getDynamicText={(v) => v.name}/>


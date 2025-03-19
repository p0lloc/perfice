<script lang="ts">
    import BindableDropdownButton from "@perfice/components/base/dropdown/BindableDropdownButton.svelte";
    import type {Form} from "@perfice/model/form/form";

    let {settings, onChange, forms}: {
        settings: { formId: string, questionId: string },
        onChange: (settings: { formId: string, questionId: string }) => void,
        forms: Form[]
    } = $props();

    let selectedForm = $derived<Form | undefined>(forms.find(f => f.id == settings.formId));
    let availableForms = $derived(forms.map(v => {
        return {value: v.id, name: v.name}
    }));

    let availableQuestions = $derived(selectedForm?.questions.map(v => {
        return {value: v.id, name: v.name}
    }) ?? []);


    function onFormChange(formId: string) {
        let form = forms.find(f => f.id == formId);
        if (form == null) return;

        onChange({
            ...settings,
            formId,
            questionId: form.questions.length > 0 ? form.questions[0].id : ""
        });
    }

    function onQuestionChange(questionId: string) {
        onChange({...settings, questionId});
    }
</script>

<div class="row-between">
    Form
    <BindableDropdownButton value={settings.formId} items={availableForms}
                            onChange={onFormChange}/>
</div>
<div class="row-between mt-2">
    Question
    <BindableDropdownButton value={settings.questionId} items={availableQuestions}
                            onChange={onQuestionChange}/>
</div>

<script lang="ts">
    import {ModalSize, ModalType} from "@perfice/model/ui/modal.js";
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {faLayerGroup, faTextHeight} from "@fortawesome/free-solid-svg-icons";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import type {Form} from "@perfice/model/form/form";
    import type {Tag} from "@perfice/model/tag/tag";
    import EditFormChecklistCondition
        from "@perfice/components/sharedWidgets/checklist/EditFormChecklistCondition.svelte";
    import type {Component} from "svelte";
    import EditTagChecklistCondition
        from "@perfice/components/sharedWidgets/checklist/EditTagChecklistCondition.svelte";
    import {
        CHECKLIST_CONDITION_TYPES,
        type ChecklistCondition,
        ChecklistConditionType
    } from "@perfice/model/sharedWidgets/checklist/checklist";

    let modal: Modal;

    let completer: (o: ChecklistCondition | null) => void;
    let condition: ChecklistCondition = $state({} as ChecklistCondition);

    let availableForms: Form[] = [];
    let availableTags: Tag[] = [];

    let currentRenderer: any = $state(null);

    export async function open(editOption: ChecklistCondition | null, forms: Form[], tags: Tag[]): Promise<ChecklistCondition | null> {
        let promise = new Promise<ChecklistCondition | null>((resolve) => completer = resolve);

        availableForms = forms;
        availableTags = tags;

        if (editOption != null) {
            condition = editOption;
        } else {
            condition = {
                id: crypto.randomUUID(),
                name: "",
                value: {
                    type: ChecklistConditionType.FORM,
                    value: {
                        formId: "",
                        answers: {}
                    }
                }
            }
        }

        modal.open();
        return promise;
    }

    function onTypeChanged(t: ChecklistConditionType) {
        switch (t) {
            case ChecklistConditionType.FORM: {
                condition.value = {
                    type: ChecklistConditionType.FORM,
                    value: {
                        formId: "",
                        answers: {}
                    }
                }
                break;
            }
            case ChecklistConditionType.TAG: {
                condition.value = {
                    type: ChecklistConditionType.TAG,
                    value: {
                        tagId: ""
                    }
                }
                break;
            }
        }
    }

    function onConfirm() {
        // If the settings hold their own state (like a form embed), finalize them before sending the updated value
        currentRenderer.finalize?.();

        completer($state.snapshot(condition));
        modal.close();
    }

    function onValueChange(v: any) {
        condition.value = {
            ...condition.value,
            value: v
        };
    }

    const RENDERERS: Record<ChecklistConditionType, Component<{
        forms: Form[],
        tags: Tag[],
        value: any,
        onChange: (v: any) => void
    }> & { finalize?: () => void }> = {
        [ChecklistConditionType.FORM]: EditFormChecklistCondition,
        [ChecklistConditionType.TAG]: EditTagChecklistCondition,
    }

    const RendererComponent = $derived(RENDERERS[condition.value.type]);
</script>

<Modal title="Edit item" bind:this={modal} type={ModalType.CONFIRM_CANCEL} size={ModalSize.MEDIUM}
       onConfirm={onConfirm} onClose={() => completer(null)}>


    <div class="row-between">
        <IconLabel icon={faTextHeight} title="Name"/>
        <input type="text" class="border" bind:value={condition.name}/>
    </div>

    <div class="row-between mt-2">
        <IconLabel icon={faLayerGroup} title="Type"/>
        <DropdownButton value={condition.value.type} items={CHECKLIST_CONDITION_TYPES} onChange={onTypeChanged}/>
    </div>

    <div class="mt-2">
        <RendererComponent bind:this={currentRenderer}
                           forms={availableForms} tags={availableTags} value={condition.value.value}
                           onChange={onValueChange}/>
    </div>
</Modal>
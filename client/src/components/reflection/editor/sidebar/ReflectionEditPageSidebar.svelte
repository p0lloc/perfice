<script lang="ts">
    import type {ReflectionEditPageAction} from "@perfice/model/reflection/ui";
    import IconPickerButton from "@perfice/components/base/iconPicker/IconPickerButton.svelte";
    import Button from "@perfice/components/base/button/Button.svelte";
    import {faTimes} from "@fortawesome/free-solid-svg-icons";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";

    let {action}: { action: ReflectionEditPageAction } = $props();

    function onNameChange(e: { currentTarget: HTMLInputElement }) {
        action.page.name = e.currentTarget.value;
        action.onChange({...action.page, name: e.currentTarget.value});
    }

    function onDescriptionChange(e: { currentTarget: HTMLTextAreaElement }) {
        action.page.description = e.currentTarget.value;
        action.onChange({...action.page, description: e.currentTarget.value});
    }

    function onIconChange(icon: string | null) {
        action.page.icon = icon;
        action.onChange({...action.page, icon: icon});
    }

    function addIcon() {
        onIconChange("\ud83c\udf19")
    }
</script>

<div class="row-between">
    Name
    <input type="text" class="border" value={action.page.name} onchange={onNameChange} placeholder="Name"/>
</div>
<div class="flex gap-2 justify-between mt-2">
    Description
    <textarea class="border" value={action.page.description} placeholder="Description"
              onchange={onDescriptionChange}></textarea>
</div>
<div class="flex gap-2 justify-between items-center mt-2">
    Icon
    {#if action.page.icon != null}
        <div class="row-gap">
            <IconPickerButton icon={action.page.icon} onChange={onIconChange}/>
            <IconButton icon={faTimes} onClick={() => onIconChange(null)}/>
        </div>
    {:else}
        <Button onClick={addIcon}>Select icon</Button>
    {/if}
</div>

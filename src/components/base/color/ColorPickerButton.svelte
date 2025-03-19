<script lang="ts">
    let {value = $bindable(), onChange}: { value: string, onChange?: (color: string) => void } = $props();
</script>

<input type="color" class="w-8 h-8 cursor-pointer p-0 rounded-md" bind:value
       onchange={(e) => onChange?.(e.currentTarget.value)}>

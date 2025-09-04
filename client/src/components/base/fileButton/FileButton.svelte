<script lang="ts">
    let fileInputElement: HTMLInputElement;

    let {onChange, displayFile, class: className = 'md:w-1/2'}: {
        onChange: (files: FileList) => void,
        displayFile?: boolean,
        class?: string
    } = $props();

    let selectedFile: File | null = $state<File | null>(null);

    function onButtonClick() {
        fileInputElement.click();
    }

    function onFileInputChange(e: Event & { currentTarget: HTMLInputElement }) {
        let files = e.currentTarget.files;
        if (files == null || files.length == 0) return;

        selectedFile = files[0];
        onChange(files);
    }
</script>

<button class="{className} border-dashed text-gray-500 border-2 w-full h-40 flex-center mt-2 rounded-xl pointer-feedback:bg-gray-100"
        onclick={onButtonClick}>
    {#if selectedFile != null && displayFile}
        {selectedFile.name}
    {:else}
        Upload files
    {/if}
</button>
<input type="file" class="hidden" bind:this={fileInputElement} onchange={onFileInputChange}/>

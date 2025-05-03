<script lang="ts">
    let fileInputElement: HTMLInputElement;

    let {onChange, displayFile}: { onChange: (files: FileList) => void, displayFile?: boolean } = $props();

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

<button class="border-dashed text-gray-500 border-2 w-full md:w-1/2 h-40 flex-center mt-2 rounded-xl pointer-feedback:bg-gray-100"
        onclick={onButtonClick}>
    {#if selectedFile != null && displayFile}
        {selectedFile.name}
    {:else}
        Upload files
    {/if}
</button>
<input type="file" class="hidden" bind:this={fileInputElement} onchange={onFileInputChange}/>

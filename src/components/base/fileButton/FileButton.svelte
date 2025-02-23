<script lang="ts">
    let fileInputElement: HTMLInputElement;

    let {onChange}: { onChange: (files: FileList) => void } = $props();

    function onButtonClick() {
        fileInputElement.click();
    }

    function onFileInputChange(e: Event & {currentTarget: HTMLInputElement}) {
        let files = e.currentTarget.files;
        if (files == null || files.length == 0) return;

        onChange(files);
    }
</script>

<button class="border-dashed text-gray-500 border-2 w-full md:w-1/2 h-40 flex-center mt-2 rounded-xl pointer-feedback:bg-gray-100"
        onclick={onButtonClick}>
    Upload files
</button>
<input type="file" class="hidden" bind:this={fileInputElement} onchange={onFileInputChange}/>

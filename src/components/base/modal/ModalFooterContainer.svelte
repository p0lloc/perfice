<script>
    let {children} = $props();
</script>

<div class="hidden md:block mt-8 bg-gray-100 border border-t-gray-300 p-4 rounded-b-xl">
    {@render children?.()}
</div>

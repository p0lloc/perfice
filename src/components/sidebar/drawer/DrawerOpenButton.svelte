<script lang="ts">
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faBars} from "@fortawesome/free-solid-svg-icons";
    import {toggleDrawer} from "@perfice/stores/ui/drawer.js";
</script>

<IconButton icon={faBars} onClick={() => setTimeout(toggleDrawer)}/>

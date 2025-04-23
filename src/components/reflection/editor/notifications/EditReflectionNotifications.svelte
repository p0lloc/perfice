<script lang="ts">
    import {NotificationType, type StoredNotification} from "@perfice/model/notification/notification";
    import IconButton from "@perfice/components/base/button/IconButton.svelte";
    import {faPlus} from "@fortawesome/free-solid-svg-icons";
    import GenericDeleteModal from "@perfice/components/base/modal/generic/GenericDeleteModal.svelte";
    import EditNotificationModal
        from "@perfice/components/reflection/editor/notifications/EditNotificationModal.svelte";
    import {updateIdentifiedInArray} from "@perfice/util/array";
    import NotificationCard from "@perfice/components/reflection/editor/notifications/NotificationCard.svelte";
    import {reflections} from "@perfice/stores";

    let {entityId, notifications, onChange}: {
        entityId: string,
        notifications: StoredNotification[],
        onChange: (v: StoredNotification[]) => void
    } = $props();

    let deleteModal: GenericDeleteModal<StoredNotification>;
    let editModal: EditNotificationModal;

    const newId = "new";

    async function addNotification() {
        onNotificationEdit({
            id: newId,
            type: NotificationType.REFLECTION,
            nativeId: 0,
            entityId,
            title: "",
            body: "",
            hour: 10,
            minutes: 0,
            weekDay: null
        })

    }

    async function onNotificationDelete(notification: StoredNotification) {
        if (notification == null) return;

        await reflections.deleteNotification(notification.id);
        onChange(notifications.filter(v => v.id != notification.id));
    }

    function onNotificationEdit(notification: StoredNotification) {
        editModal.open(structuredClone($state.snapshot(notification)));
    }

    async function onNotificationSave(notification: StoredNotification) {
        if (notification.id == newId) {
            let result = await reflections.createNotification(entityId, notification.hour, notification.minutes, notification.weekDay);
            onChange([...notifications, result]);
        } else {
            await reflections.updateNotification(notification);
            onChange(updateIdentifiedInArray(notifications, notification));
        }
    }
</script>

<div class="row-gap">
    <h3 class="text-lg md:text-2xl font-bold text-gray-700">Reminders</h3>
    <IconButton icon={faPlus} onClick={addNotification}/>
</div>

<EditNotificationModal onSave={onNotificationSave} bind:this={editModal}/>
<GenericDeleteModal subject="this reminder" onDelete={onNotificationDelete} bind:this={deleteModal}/>
<div class="flex-col flex gap-2 md:w-1/2">
    {#each notifications as notification}
        <NotificationCard {notification} onEdit={() => onNotificationEdit(notification)}
                          onDelete={() => deleteModal.open(notification)}/>
    {:else}
        <p>There are no reminders set for this reflection.</p>
    {/each}
</div>
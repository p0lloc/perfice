<script lang="ts">
    import {faBell} from "@fortawesome/free-solid-svg-icons";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import {NOTIFICATION_WEEKDAYS, type StoredNotification} from "@perfice/model/notification/notification";
    import {formatTimestampHHMM} from "@perfice/util/time/format";

    let {notification, onEdit, onDelete}: {
        notification: StoredNotification,
        onEdit: () => void,
        onDelete: () => void,
    } = $props();

    let weekDayTitle = $derived(NOTIFICATION_WEEKDAYS.find(v => v.value == notification.weekDay)?.name ?? "");
    let timeTitle = $derived(formatTimestampHHMM((notification.hour * 60 + notification.minutes) * 60 * 1000));
    let title = $derived(`${weekDayTitle} ${timeTitle}`);
</script>

<GenericEditDeleteCard icon={faBell} text={title} onEdit={onEdit}
                       onDelete={onDelete}/>

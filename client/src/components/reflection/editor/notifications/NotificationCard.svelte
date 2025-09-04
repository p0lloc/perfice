<script lang="ts">
    import {faBell} from "@fortawesome/free-solid-svg-icons";
    import GenericEditDeleteCard from "@perfice/components/base/card/GenericEditDeleteCard.svelte";
    import {NOTIFICATION_WEEKDAYS, type StoredNotification} from "@perfice/model/notification/notification";
    import {formatTimestampHHMM} from "@perfice/util/time/format";
    import {utcHhMmToLocal} from "@perfice/util/time/simple";

    let {notification, onEdit, onDelete}: {
        notification: StoredNotification,
        onEdit: () => void,
        onDelete: () => void,
    } = $props();

    let weekDayTitle = $derived(NOTIFICATION_WEEKDAYS.find(v => v.value == notification.weekDay)?.name ?? "");
    let [localHour, localMinutes] = $derived(utcHhMmToLocal(notification.hour, notification.minutes));
    let timeTitle = $derived(`${localHour.toString().padStart(2, "0")}:${localMinutes.toString().padStart(2, "0")}`);
    let title = $derived(`${weekDayTitle} ${timeTitle}`);
</script>

<GenericEditDeleteCard icon={faBell} text={title} onEdit={onEdit}
                       onDelete={onDelete}/>

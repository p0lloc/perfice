<script lang="ts">
    import Modal from "@perfice/components/base/modal/Modal.svelte";
    import {ModalSize, ModalType} from "@perfice/model/ui/modal";
    import {faCalendarWeek, faClock} from "@fortawesome/free-solid-svg-icons";
    import IconLabel from "@perfice/components/base/iconLabel/IconLabel.svelte";
    import DropdownButton from "@perfice/components/base/dropdown/DropdownButton.svelte";
    import {NOTIFICATION_WEEKDAYS, type StoredNotification} from "@perfice/model/notification/notification";
    import TimePicker from "@perfice/components/base/timePicker/TimePicker.svelte";
    import {localHhMmToUtc, utcHhMmToLocal} from "@perfice/util/time/simple";

    let modal: Modal;

    let notification = $state<StoredNotification>({} as StoredNotification);
    let {onSave}: { onSave: (no: StoredNotification) => void } = $props();

    export function open(editNotification: StoredNotification) {
        notification = editNotification;
        modal.open();
    }

    function onWeekDayChange(value: number | null) {
        notification.weekDay = value;
    }

    function onConfirm() {
        onSave($state.snapshot(notification));
        modal.close();
    }

    function onTimeChange(time: number) {
        let hours = Math.floor(time / 60);
        let minutes = time % 60;

        let [utcHours, utcMinutes] = localHhMmToUtc(hours, minutes);
        notification.hour = utcHours;
        notification.minutes = utcMinutes;
    }

    let [localHour, localMinutes] = $derived(utcHhMmToLocal(notification.hour, notification.minutes));
</script>

<Modal type={ModalType.CONFIRM_CANCEL}
       onConfirm={onConfirm}
       bind:this={modal} title="Edit notification" size={ModalSize.MEDIUM}>
    <div class="row-between">
        <IconLabel icon={faClock} title="Time"/>
        <TimePicker time={localHour * 60 + localMinutes}
                    day={true} onChange={onTimeChange}/>
    </div>
    <div class="row-between mt-2">
        <IconLabel icon={faCalendarWeek} title="Week day"/>
        <DropdownButton value={notification.weekDay} items={NOTIFICATION_WEEKDAYS} onChange={onWeekDayChange}/>
    </div>
</Modal>
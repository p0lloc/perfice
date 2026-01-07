import timezonesAsset from '@perfice/assets/timezones.json?raw'

export let TIME_ZONES: string[];
try {
    TIME_ZONES = JSON.parse(timezonesAsset);
} catch (e) {
    TIME_ZONES = [];
}
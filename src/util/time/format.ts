export function formatDateYYYYMMDD(date: Date) {
    let year = date.getUTCFullYear();
    let month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    let day = date.getUTCDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getYesterdaysISOTimeStr() {
    // yesterday's time
    const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

    // ISO string of yesterday's time
    const yesterdayStr = yesterday.toISOString();

    return yesterdayStr;
}
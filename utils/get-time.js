export function getYesterdaysISOTimeStr() {
    // yesterday's time
    const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

    // ISO string of yesterday's time
    const yesterdayStr = yesterday.toISOString();

    return yesterdayStr;
};

export function getNDaysFromNowISOTimeStr(numberOfDaysToAdd){
    // current time
    const now = new Date();
    
    // N days from now
    const nDaysFromNow = new Date(now.setDate(now.getDate() + numberOfDaysToAdd));

    // ISO string of N days from now
    return nDaysFromNow.toISOString();
}
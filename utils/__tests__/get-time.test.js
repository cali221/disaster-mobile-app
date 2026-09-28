import { getYesterdaysISOTimeStr } from "../get-time";
import { getNDaysFromNowISOTimeStr } from "../get-time";

jest.useFakeTimers();

describe('getYesterdayISOTimeStr function', () => {
  it('should show date of yesterday', () => {
    expect(new Date(getYesterdaysISOTimeStr()).getDate()).toBe(new Date(new Date() - 24 * 60 * 60 * 1000).getDate());
  });

  it('should show the same hour as now', () => {
    expect(new Date(getYesterdaysISOTimeStr()).getHours()).toBe(new Date().getHours());
  });

  it('should show the same minutes as now', () => {
    expect(new Date(getYesterdaysISOTimeStr()).getMinutes()).toBe(new Date().getMinutes());
  });

  it('should show the same seconds as now', () => {
    expect(new Date(getYesterdaysISOTimeStr()).getSeconds()).toBe(new Date().getSeconds());
  });
});

describe('getNDaysFromNowISOTimeStr function when parameter is 1', () => {
  it('should show date of 1 day from now', () => {
    const now = new Date();
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getDate()).toBe(new Date(now.setDate(now.getDate() + 1)).getDate());
  });

  it('should show the same hour as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getHours()).toBe(new Date().getHours());
  });

  it('should show the same minutes as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getMinutes()).toBe(new Date().getMinutes());
  });

  it('should show the same seconds as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getSeconds()).toBe(new Date().getSeconds());
  });
})

describe('getNDaysFromNowISOTimeStr function when parameter is > 1 (e.g. 3)', () => {
  it('should show date of 3 day from now', () => {
    const now = new Date();
    expect(new Date(getNDaysFromNowISOTimeStr(3)).getDate()).toBe(new Date(now.setDate(now.getDate() + 3)).getDate());
  });

  it('should show the same hour as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(3)).getHours()).toBe(new Date().getHours());
  });

  it('should show the same minutes as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(3)).getMinutes()).toBe(new Date().getMinutes());
  });

  it('should show the same seconds as now', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(3)).getSeconds()).toBe(new Date().getSeconds());
  });
})

describe('getNDaysFromNowISOTimeStr function when current date is at the end of the month', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-31'));
  it('should show date first day of next month when parameter is 1', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getDate()).toBe(new Date('2026-11-01').getDate());
  });

  it('should show date second day of next month when parameter is 2', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(2)).getDate()).toBe(new Date('2026-11-02').getDate());
  });

  it('should show the same hour as now e.g. when parameter is 1', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getHours()).toBe(new Date().getHours());
  });

  it('should show the same minutes as now e.g. when parameter is 1', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getMinutes()).toBe(new Date().getMinutes());
  });

  it('should show the same seconds as now e.g. when parameter is 1', () => {
    expect(new Date(getNDaysFromNowISOTimeStr(1)).getSeconds()).toBe(new Date().getSeconds());
  });
})
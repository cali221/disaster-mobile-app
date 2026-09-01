import { getYesterdaysISOTimeStr } from "../get-time";

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
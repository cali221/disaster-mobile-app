import { roundTo2DP } from "../rounding";

describe('roundTo2DP function', () => {
    it('should return number with 2 decimal places with correct rounding', ()=>{
        expect(roundTo2DP(1.2345)).toBe(1.23);
    });
});
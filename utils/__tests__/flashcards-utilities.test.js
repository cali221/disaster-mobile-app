import { getCardUpdatedValsUsingSM2 } from "../flashcards-utilities";
import { getNDaysFromNowISOTimeStr } from "../get-time";

jest.useFakeTimers();

/**
 *  parameter order:
 *  cardReps, 
    cardInterval, 
    cardEaseFactor, 
    recallEaseVal
 */
describe('getCardUpdatedValsUsingSM2 function', () => {
    it('should return the right object when recall ease value is less than 3', () =>{
        expect(getCardUpdatedValsUsingSM2(1, 1, 2.5, 1)).toStrictEqual({newCardReps: 0,
                                                                        newCardInterval: 1,
                                                                        newCardEF: 2.5,
                                                                        newDueDate: getNDaysFromNowISOTimeStr(1)});}
    );

    it('should return the right object card repetition is 0, current interval is null, current ease factor is 2.5 and recall ease value is > 3', () => {
        expect(getCardUpdatedValsUsingSM2(0, null, 2.5, 4)).toStrictEqual({newCardReps: 1,
                                                                           newCardInterval: 1,
                                                                           newCardEF: 2.5 + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)),
                                                                           newDueDate: getNDaysFromNowISOTimeStr(1)});
        }
    );

    it('should return the right object card repetition is 1, current interval is 1, current ease factor is 2.5 and recall ease value is > 3', () => {
        expect(getCardUpdatedValsUsingSM2(1, 1, 2.5, 4)).toStrictEqual({newCardReps: 2,
                                                                        newCardInterval: 6,
                                                                        newCardEF: 2.5 + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)),
                                                                        newDueDate: getNDaysFromNowISOTimeStr(6)});
        }
    );

    it('should return the right object card repetition is > 1, current interval is 6, current ease factor is 2.5 and recall ease value is > 3', () => {
        expect(getCardUpdatedValsUsingSM2(2, 6, 2.5, 4)).toStrictEqual({newCardReps: 3,
                                                                        newCardInterval: 15,  // 6 * 2.5 then rounded up
                                                                        newCardEF: 2.5 + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)),
                                                                        newDueDate: getNDaysFromNowISOTimeStr(15)});
        }
    );

    it('should return the right object card repetition is > 1, current interval is 6, new ease factor is < 1.3 and recall ease value is > 3', () => {
        expect(getCardUpdatedValsUsingSM2(2, 6, 1.2, 4)).toStrictEqual({newCardReps: 3,
                                                                        newCardInterval: 8,  // 6 * 1.2 then rounded up
                                                                        newCardEF: 1.3,
                                                                        newDueDate: getNDaysFromNowISOTimeStr(8)});
        }
    );
});
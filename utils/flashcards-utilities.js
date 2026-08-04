/**
 * flashcards related functions
 */

import { getNDaysFromNowISOTimeStr } from "./get-time";

/* function to get new stats value for a flashcard following the SM-2 algorithm,
   as described on https://super-memory.com/english/ol/sm2.htm */
export function getCardUpdatedValsUsingSM2(cardReps, 
                                           cardInterval, 
                                           cardEaseFactor, 
                                           recallEaseVal){
    // if recall quality is less than 3, 'reset' the card but don't change ease the factor
    if(recallEaseVal < 3){
        return {
            newCardReps: 0,
            newCardInterval: 1,
            newCardEF: cardEaseFactor,
            newDueDate: getNDaysFromNowISOTimeStr(1)
        }
    }
    else{
        if(cardReps == 0) {  
            cardInterval = 1;
        } 
        else if (cardReps == 1) {  
            cardInterval = 6; 
        } 
        else {  
            // if interval is a fraction/float, round it up to an integer.
            cardInterval = Math.ceil(cardReps * cardEaseFactor);
        }  

        cardReps += 1;

        const newCardEaseFactor =  cardEaseFactor + (0.1 - (5 - recallEaseVal) * (0.08 + (5 - recallEaseVal) * 0.02));

        if(newCardEaseFactor < 1.3){
            newCardEaseFactor = 1.3
        }
        
        cardEaseFactor = newCardEaseFactor;

        return {
            newCardReps: cardReps,
            newCardInterval: cardInterval,
            newCardEF: newCardEaseFactor,
            newDueDate: getNDaysFromNowISOTimeStr(cardInterval)
        }
    }   
}
/**
 * flashcards related functions
 */

export async function getCardUpdatedVals(cardReps, cardInterval, cardEaseFactor, recallEaseVal){
    // if recall quality is less than 3, 'reset' the card but don't change ease the factor
    if(recallEaseVal < 3){
        return {
            repetition: 0,
            interval: 1,
            cardEaseFactor: cardEaseFactor 
        }
    }
    else{
        
    }
    
}
/**
 * flashcards related functions
 */

import { supabase } from "../lib/supabase"; 

export async function fetchFlashcardsToReview(){
    const { data, error } = supabase.schema('public')
                                    .rpc('get_flashcards_to_review_for_auth_user');

    if(error){
        throw error;
    }
    else{
        return data;
    }
};
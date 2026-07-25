/**
 * flashcards related functions
 */

import { supabase } from "../lib/supabase"; 

export async function fetchFlashcardsToReview(userId){
    const { data, error } = supabase.schema('public')
                                    .rpc('get_flashcards_to_review', {user_id_input: userId});

    if(error){
        throw error;
    }
    else{
        return data;
    }
};
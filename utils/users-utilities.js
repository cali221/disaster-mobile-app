import { supabase } from '../lib/supabase';

// function to follow 
export async function addFollow(user1_id, user2_id){
    const { error } = await supabase.schema('users')
                                    .from('user_1_is_following_user_2')
                                    .insert({
                                        user1: user1_id,
                                        user2: user2_id
                                    });
                            
    if(error){
        throw error;
    }
};

// function to get followers count
export async function getFollowersCount(userId){
    const { count, error } = await supabase.schema('users')
                                           .from('user_1_is_following_user_2')
                                           .select('*', { count: 'exact', head: true })
                                           .eq('user2', userId)
        
    if(error){
        throw error;
    }
    else{
        return count;
    }
};

// function to get following count
export async function getFollowingCount(userId){
    const { count, error } = await supabase.schema('users')
                                           .from('user_1_is_following_user_2')
                                           .select('*', { count: 'exact', head: true })
                                           .eq('user1', userId)

                            
    if(error){
        throw error;
    }
    else{
        return count;
    }
};
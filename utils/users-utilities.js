/**
 * users related utilities that might be shared between screens 
 */

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

// function to fetch user's profile data
export async function getUserProfileData(userId){
    const { data, error } = await supabase.schema('public')
                                          .rpc('get_user_profile_data', {user_id_input: userId})
                                          .single();

    if(error){
        throw error;
    }
    else{
        return data;
    }
};

// function to get following
export async function getFollowing(userId){
    const { data, error } = await supabase.schema('users')
                                          .from('user_1_is_following_user_2')
                                          .select(`profiles_public_data!user_1_is_following_user_2_user2_fkey (user_id, username, avatar_img_url)`)
                                          .eq('user1', userId);

    if(error){
         console.error(error)
        throw error;
    }
    else{
        return data;
    }
};


// function to get followers
export async function getFollowers(userId){
    const { data, error } = await supabase.schema('users')
                                          .from('user_1_is_following_user_2')
                                          .select(`profiles_public_data!user_1_is_following_user_2_user1_fkey (user_id, username, avatar_img_url)`)
                                          .eq('user2', userId);

    if(error){
        throw error;
    }
    else{
        return data;
    }
};
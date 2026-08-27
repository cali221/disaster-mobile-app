/**
 * users related utilities that might be shared between screens 
 */

import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';

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

// function to unfollow
export async function removeFollow(user1_id, user2_id){
    const { error } = await supabase.schema('users')
                                    .from('user_1_is_following_user_2')
                                    .delete()
                                    .eq('user1', user1_id)
                                    .eq('user2', user2_id);
                            
    if(error){
        throw error;
    }
};

// function to get leaderboard for user
export async function getLeaderboard(userId){
    const { data, error } = await supabase.schema('public')
                                          .rpc('get_leaderboard_for_user', {user_id_input: userId});

    if(error){
        throw error;
    }
    else{
        return data;
    }
};

// function to fetch user's profile data
export async function getUserProfileData(userId) {
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

// function to get user's trusted contacts
export async function getTrustedContacts(userId) {
    const { data, error } = await supabase.schema('users')
                                            .from('users_trusted_contacts')
                                            .select()
                                            .eq('user_id', userId);

    if(error){
        throw error;
    }
    else{
        return data;
    }
};

// function to get user's current location
export async function getUserCurrentLocation(){
    // the permission status for location
    const { status } = await Location.requestForegroundPermissionsAsync();

    // if permission is not granted, inform user
    if (status !== 'granted') {
        throw new Error('No permission to access location');
    }
    else{
        // get the user's location data
        const location = await Location.getCurrentPositionAsync({});

        return location;
    }
}
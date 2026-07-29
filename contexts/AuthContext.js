import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // function to update user state
  const setLoggedInUser = useCallback((loggedInUser) => {
    setUser(loggedInUser);
  }, [user]);

  // function for signing up
  const signUp = useCallback(async (email, password, username) => {
    const {data, error} = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        },
      },
    });

    if(error){
      throw error;
    }
  }, []);

  // function for signing out
  const signOut = useCallback(async() => {  
    const activePushToken = await AsyncStorage.getItem('activePushToken');
    if(activePushToken){
      console.log('Push token in local storage to be removed : ' + activePushToken);
      const { error } = await supabase.schema('users')
                                      .from('users_push_tokens')
                                      .delete()
                                      .eq('expo_push_token', activePushToken);

      await AsyncStorage.removeItem('activePushToken');
      Notifications.unregisterForNotificationsAsync();

      /* if error just console.error because it's unwanted that 
         user fails to log out due to failed process for token managament
         or being shown error for it */
      if(error){
        console.error(error.message);
      }
    }
    else{
      console.log('No active push token in async storage');
    }

    const { error } = await supabase.auth.signOut();

    if(error){
      throw error;
    }
  }, []);

  // function to upsert the expo push token 
  const upsertExpoPushToken = useCallback(async(pushToken, userId) => {
    const { data, error } = await supabase.schema('users')
                                          .from('users_push_tokens')
                                          .upsert(
                                            {
                                              user_id: userId, 
                                              expo_push_token: pushToken
                                            }, 
                                            {
                                              onConflict: 'user_id, expo_push_token',
                                              ignoreDuplicates: true
                                            });

    if(error){
      throw error;
    }
  }, []);

  // function to sign in to supabase
  const signIn = useCallback(async(email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error){
      throw error;
    }
    else{
      return data.user;
    }
  }, []);

  // add listener for auth state change and update user state accordingly
  useEffect(() => { 
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if(event=='SIGNED_IN'){
        
      }
      setLoggedInUser(session?.user);
    });
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setLoggedInUser,
    signOut,
    upsertExpoPushToken,
    signIn,
    signUp
  }), [user, setLoggedInUser, signOut, upsertExpoPushToken, signIn, signUp]);

   return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from '../lib/supabase';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../utils/register-for-notifications";
import { getUserProfileData,
         getTrustedContacts } from "../utils/users-utilities";
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);

  /* separate user profile satate from auth user state to prevent 
     unnecessary re-renders on screen that don't use profile data
     and keep management simpler */
  const [userProfile, setUserProfile] = useState(null);

  // function to update user state
  const setLoggedInUser = useCallback((loggedInUser) => {
    setUser(loggedInUser);
  }, [user]);

  // function to update user profile state
  const setLoggedInUserProfile = useCallback((loggedInUserProfile) => {
    setUserProfile(loggedInUserProfile)
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
    // get active push token from async storage
    const activePushToken = await AsyncStorage.getItem('activePushToken');

    if(activePushToken){
        // remove push token from DB
        console.log('Push token in local storage to be removed : ' + activePushToken);
        const { error } = await supabase.schema('users')
                                        .from('users_push_tokens')
                                        .delete()
                                        .eq('expo_push_token', activePushToken);


        // remove push token from async storage
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
    };

    // get trusted contacts from async storage
    const trustedContactsInAsyncStorage = await AsyncStorage.getItem('trustedContacts');

    if(trustedContactsInAsyncStorage){
        console.log('Trusted contacts in async storage: ' + trustedContactsInAsyncStorage);

        // remove trusted contacts from async storage
        await AsyncStorage.removeItem('trustedContacts');
    }
    else{
        console.log('No trusted contacts in async storage');
    }

    // sign out
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

    if(error){
      throw error;
    }
    else if(data?.user?.id){
      // get expo push token
      const pushToken = await registerForPushNotificationsAsync();

      /* if there is a token upsert to profiles table with the token,
          otherwise upsert with null push token */
      if(pushToken){
        await upsertExpoPushToken(pushToken, data.user.id);

        // store push token in async storage to delete later when signing out
        await AsyncStorage.setItem('activePushToken', pushToken);
      }

      // get trusted contacts of user
      const trustedContacts = await getTrustedContacts(data.user.id);

      // set trusted contacts in async storage
      await AsyncStorage.setItem('trustedContacts', JSON.stringify(trustedContacts));
    }
  }, []);

  const fetchAndSetProfileData = useCallback(async(userId) => {
    console.log('fetchAndSetProfileData called');
    const profileData = await getUserProfileData(userId);

    if(profileData){
      setLoggedInUserProfile(profileData)
    }
    else{
      throw new Error(t('shared.userProfileDataNotFound'));
    }
    
  }, []);

  // add listener for auth state change and update user state accordingly
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);

      setLoggedInUser(session?.user);
    
      if(event !== 'SIGNED_OUT' && session?.user?.id){
        try{
          fetchAndSetProfileData(session.user.id);
        }
        catch(error){
          console.error(error)
          setLoggedInUserProfile(null);
        }
      }
      else{
        setLoggedInUserProfile(null);
      }
    });
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setLoggedInUser,
    signOut,
    upsertExpoPushToken,
    signIn,
    signUp,
    fetchAndSetProfileData,
    userProfile
  }), [user,
       setLoggedInUser,
       signOut,
       upsertExpoPushToken,
       signIn,
       signUp,
       fetchAndSetProfileData,
       userProfile]);

   return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
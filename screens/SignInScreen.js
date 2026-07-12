import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';
import { showErrorToast, showInfoToast, showSuccessToast } from '../utils/showToast';
import AsyncStorage from "@react-native-async-storage/async-storage";

// set how the notification should be shown if it happens while the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  })
});

export function SignInScreen({navigation}){
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // function to sign in to supabase
  const signIn = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error){
      throw new Error(error.message);
    }
    setIsLoading(false);
  }

  // function to upsert the expo push token 
  const upsertExpoPushToken = async (userId, pushToken) => {
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
      throw new Error(`${error.message}`);
    }
  }

  // function to register for push notification using Expo
  // Start of code I did not write myself
  // Taken and slightly modified from:

  // Title: notifications.mdx

  // Author: commit authored by Aman Mittal (https://github.com/amandeepmittal) in a repository by Expo (https://github.com/expo)

  // Date: May 26, 2026

  // Code version: commit be06320

  // Availability: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx
  
  // The repository the original code is in is licensed under the MIT License.
  // A copy of the license can be found on THIRD-PARTY-LICENSES-MANUAL-ADDITION.MD file at the root directory of this project 
  // under the section "Expo (https://github.com/expo/expo)" and also shown below:
  /*
  The MIT License (MIT)

  Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */

  // Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
  // Modified by me. Changes I made:
  // - I added comments
  // - I changed some setNotificationChannelAsync parameter values
  // - I changed the alert message if notification permission is not granted
  // - I changed console.log for showing generated push token message slightly
  // - I changed the functionn into an arrow function for consistency with the rest of the codebase
  // - I throw an error if the token wasn't successfully generated instead of setting token to the error string
  const registerForPushNotificationsAsync = async() => {
    // the Expo push notification token
    let token;

    // set notification channel (needed to make permissions prompt appear)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('finalProjectAppNotificationChannel', {
        name: "Final project applications's push notification channel",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // get notification permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    // set final status as existing status initially
    let finalStatus = existingStatus;

    // if currently push notification permission is not grantedm request for the permission
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // if final status is stil not granted, alert the user that it's needed to get notifications
    if (finalStatus !== 'granted') {
      showInfoToast('Permission is needed to send push notifications.');
      return;
    }

    // if notification permission is granted, try to get the Expo push token
    try {
      // get the project ID
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error('Project ID was not found');
      }
      
      // get the Expo push token
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    
      console.log("Expo push token: " + token);
    } 
    catch(error) {
      throw new Error(`Failed to obtain token for push notification. ${error}`);
    }

    return token;
  }
  // End of code I did not write myself

  // function to handle the sign in process (sign in -> get expo push token -> upsert expo push token)
  const handleSignIn = async (userId) => {
    try{
      setIsLoading(true);
      await signIn();

      // get expo push token
      const pushToken = await registerForPushNotificationsAsync();

      await AsyncStorage.setItem('activePushToken', pushToken);

      const value = await AsyncStorage.getItem('activePushToken');
      console.log('Active push token: ' + value) ;

      /* if there is a token upsert to profiles table with the token, 
          otherwise upsert with null push token */
      if(pushToken){
        await upsertExpoPushToken(userId, pushToken);
      }
      else{
        await upsertExpoPushToken(userId, null);
      }

      navigation.popTo('Home');

    }
    catch(error){
      console.log(error);
      showErrorToast('Login failed', error.message);
    }
    setIsLoading(false);
  }

  return(
    <View style={styles.signInScreenContainer}>
      {/* sign in form */}
      <View style={styles.signInInputForm}>
        {/* email input area */}
        <View style={styles.signInInputFormFields}>
          <Text>Email</Text>
          <TextInput onChangeText={setEmail}
                     value={email}
                     style={styles.signInTextInputPasswordEmail} />
        </View>

        {/* password input area */}
        <View style={styles.signInInputFormFields}>
          <Text>Password</Text>
          <TextInput onChangeText={setPassword}
                     value={password}
                     style={styles.signInTextInputPasswordEmail} />
        </View>

        {/* button to sign in */}
        <TouchableOpacity onPress={() => {handleSignIn()}}
                          style={styles.signInBtn}>
          <Text>
            Sign In
          </Text>
        </TouchableOpacity>

        {/* area for showing sign up text and link */}
        <View style={styles.signUpArea}>
            <Text style={styles.signUpAreaTxts}>
                Don't have an account yet?
            </Text>

            {/* link to go to sign up screen */}
            <TouchableOpacity onPress={() => {navigation.navigate('Sign Up')}}>
                <Text style={[styles.signUpAreaTxts, styles.signUpTxt]}>
                    Sign up here
                </Text>
            </TouchableOpacity>
          </View>
      </View>
      {
        isLoading == true && (
          <ActivityIndicator size="large" color='pink' />
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  // screen content container
  signInScreenContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%'
  },
  // container of form field with text input and label
  signInInputFormFields: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20
  },
  // container of the sign in form
  signInInputForm: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
    width: '80%',
    borderWidth: 2,
    borderColor: 'grey',
    borderRadius: 20,
    marginTop: 50,
    maxWidth: 350
  },
  // text input field for both password and email
  signInTextInputPasswordEmail: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 15
  },
  // button to sign in
  signInBtn: {
    width: '100%',
    backgroundColor: 'pink',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 20,
    marginBottom: 20
  },
  /* container of area for showing 'Don't have an account yet?' text 
     and touchable opacity to sign up */
  signUpArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // texts inside the sign up area
  signUpAreaTxts: {
    fontSize: 15
  },
  // the "Sign up here" text, should be underline so it looks like a link
  signUpTxt: {
    textDecorationLine: 'underline'
  }
})
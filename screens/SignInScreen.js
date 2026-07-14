import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState, useContext, useEffect } from 'react';
import { showErrorToast } from '../utils/showToast';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { registerForPushNotificationsAsync } from '../utils/registerForNotifications';
import { useIsFocused } from '@react-navigation/native';

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
  const { user, signIn, upsertExpoPushToken } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const handleNavigation = () => {
    // if there is a referrer screen, go back to that screen
    if(route.params?.originalScreen){
      navigation.popTo(route.params.originalScreen);
    }
    // otherwise, go to the home screen
    else{
      navigation.popTo('Home Stack', {
        screen: 'Home',
        initial: false,
        params: {},
      });
    }
  }

  // function to handle the sign in process (sign in -> get expo push token -> upsert expo push token)
  const handleSignIn = async (email, password) => {
    try{
      setIsLoading(true);

      // sign in to supabase 
      // user state in AuthContext will be updated and user.id will be obtained if successful
      const userData = await signIn(email, password);

      if(!userData?.id){
        throw new Error('Unable to obtain user ID');
      }

      // get expo push token
      const pushToken = await registerForPushNotificationsAsync();

      /* if there is a token upsert to profiles table with the token, 
          otherwise upsert with null push token */
      if(pushToken && userData.id){
        // store push token in async storage to delete later when signing out
        await AsyncStorage.setItem('activePushToken', pushToken);

        // check the push token in async storage
        const value = await AsyncStorage.getItem('activePushToken');
        console.log('Active push token in async storage: ' + value);

        await upsertExpoPushToken(pushToken, userData.id);
      }

      handleNavigation();
    }
    catch(error){
      console.log(error);
      showErrorToast(t('signInScreen.signInFailed'), error.message ?? error);
    }
    setIsLoading(false);
  }

  /* when screen loads, check if user is already available, 
     handle navigation if there's user */
  useEffect(()=>{
    if(user){
      handleNavigation();
    }
  }, [isFocused]);

  return(
    <View style={styles.signInScreenContainer}>
      {/* sign in form */}
      <View style={styles.signInInputForm}>
        {/* email input area */}
        <View style={styles.signInInputFormFields}>
          <Text>{t('authWords.email')}</Text>
          <TextInput onChangeText={setEmail}
                     value={email}
                     style={styles.signInTextInputPasswordEmail} />
        </View>

        {/* password input area */}
        <View style={styles.signInInputFormFields}>
          <Text>{t('authWords.password')}</Text>
          <TextInput onChangeText={setPassword}
                     value={password}
                     style={styles.signInTextInputPasswordEmail} />
        </View>

        {/* button to sign in */}
        <TouchableOpacity onPress={() => {handleSignIn(email, password)}}
                          style={styles.signInBtn}>
          <Text>
            {t('authWords.signIn')}
          </Text>
        </TouchableOpacity>

        {/* area for showing sign up text and link */}
        <View style={styles.signUpArea}>
            <Text style={styles.signUpAreaTxts}>
                {t('signInScreen.dontHaveAccountYet')}
            </Text>

            {/* link to go to sign up screen */}
            <TouchableOpacity onPress={() => {navigation.navigate('Sign Up', 
                                                                  {originalScreen: route.params.originalScreen})}}>
                <Text style={[styles.signUpAreaTxts, styles.signUpTxt]}>
                {t('signInScreen.signUpHere')}
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
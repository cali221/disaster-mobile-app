import { StyleSheet, 
         Text, 
         View, 
         TouchableOpacity, 
         TextInput, 
         ActivityIndicator, 
         ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast } from '../utils/showToast';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import { registerForPushNotificationsAsync } from '../utils/registerForNotifications';
import { StatusBar } from 'expo-status-bar';

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
  const { signIn, upsertExpoPushToken } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t, i18n } = useTranslation();

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

      //handleNavigation();
    }
    catch(error){
      console.log(error);
      showErrorToast(t('signInScreen.signInFailed'), error.message ?? error);
    }
    setIsLoading(false);
  }

  return(
    <ScrollView style={[styles.signInScreenScrollView, { paddingTop: insets.top,
                                                         paddingBottom: insets.bottom,
                                                         paddingLeft: insets.left,
                                                         paddingRight: insets.right }]}>
      <View style={styles.signInScreenContainer}>
        <StatusBar style="auto" />
        {/* sign in form */}
        <View style={styles.signInInputForm}>
          {/* email input area */}
          <View style={styles.signInInputFormFields}>
            <Text style={styles.inputFormLabelTxt}>{t('authWords.email')}</Text>
            <TextInput onChangeText={setEmail}
                      value={email}
                      style={styles.signInTextInputPasswordEmail} />
          </View>

          {/* password input area */}
          <View style={styles.signInInputFormFields}>
            <Text style={styles.inputFormLabelTxt}>{t('authWords.password')}</Text>
            <TextInput onChangeText={setPassword}
                      value={password}
                      style={styles.signInTextInputPasswordEmail} />
          </View>

          {/* button to sign in */}
          <TouchableOpacity onPress={() => {handleSignIn(email, password)}}
                            style={styles.signInBtn}>
            <Text style={styles.signInBtnTxt}>
              {t('authWords.signIn')}
            </Text>
          </TouchableOpacity>

          {/* area for showing sign up text and link */}
          <View style={styles.signUpArea}>
              <Text style={styles.signUpAreaTxts}>
                  {t('signInScreen.dontHaveAccountYet')}
              </Text>

              {/* link to go to sign up screen */}
              <TouchableOpacity onPress={() => {navigation.navigate('Sign Up')}}>
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // scroll view container of the screen
  signInScreenScrollView: {
    backgroundColor:'white',
    flex: 1,
    width: '100%'
  },
  // screen content container
  signInScreenContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    marginBottom: 70
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
    maxWidth: 350
  },
  // text input field for both password and email
  signInTextInputPasswordEmail: {
    borderColor: 'lightgrey',
    borderWidth: 2,
    borderRadius: 20,
    width: '100%',
    height: 45,
    paddingHorizontal: 15,
    elevation: 1,
    backgroundColor: 'white'
  },
  // label texts in input form
  inputFormLabelTxt: {
    color: '#2D3782',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 10
  },
  // button to sign in
  signInBtn: {
    width: '100%',
    backgroundColor: '#2D3782',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    borderRadius: 20,
    marginBottom: 20
  },
  // text inside button to sign in
  signInBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
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
    fontSize: 17,
    fontWeight: '500'
  },
  // the "Sign up here" text, should be underline so it looks like a link
  signUpTxt: {
    textDecorationLine: 'underline'
  }
})
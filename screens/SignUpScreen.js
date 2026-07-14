import { StyleSheet, 
         Text, 
         View, 
         TouchableOpacity, 
         TextInput, 
         ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'
import { useState, useContext } from 'react'
import { showErrorToast, showSuccessToast } from '../utils/showToast';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export function SignUpScreen({navigation}){
  // state handling when the loading spinner should be shown
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const { signUp } = useContext(AuthContext);
  
  // function for handling signing up
  const callSignUp = async () => {
    setIsLoading(true);
    try{
      await signUp(email, password, username);
      showSuccessToast(t('signUpScreen.accountCreated'), t('signUpScreen.welcome'));
    }
    catch(error){
      if(error.status == 500){
        showErrorToast(t('signUpScreen.signUpFailed'), t('signUpScreen.usernameMightBeInvalidOrTaken'));
      }
      else{
        showErrorToast(t('signUpScreen.signUpFailed'), error.message ?? error);
      }
    }
    setIsLoading(false);
  } 

  return(
    <View style={styles.signUpScreenContainer}>
      {/* sign up form */}
      <View style={styles.signUpInputForm}>
        {/* username input field */}
        <View style={styles.signUpInputFormFields}>
          <Text>Username</Text>
          <TextInput onChangeText={setUsername}
                      value={username}
                      style={styles.signUpTextInput} />
        </View>

        {/* email input field */}
        <View style={styles.signUpInputFormFields}>
          <Text>{t('authWords.email')}</Text>
          <TextInput onChangeText={setEmail}
                     value={email}
                     style={styles.signUpTextInput} />
        </View>

        {/* password input field */}
        <View style={styles.signUpInputFormFields}>
          <Text>{t('authWords.password')}</Text>
          <TextInput onChangeText={setPassword}
                     value={password}
                     style={styles.signUpTextInput} />
        </View>

        {/* button to sign up */}
        <TouchableOpacity onPress={() => {callSignUp()}}
                          style={styles.signUpBtn}>
          <Text>
            {t('authWords.signUp')}
          </Text>
        </TouchableOpacity>

        <Text>
          {t('signUpScreen.alreadyHaveAnAccount')}
        </Text>
        <TouchableOpacity onPress={() => {navigation.navigate('Sign In')}} >
          <Text>{t('signUpScreen.signInHere')}</Text>
        </TouchableOpacity>
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
  signUpScreenContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '100%',
    height: '100%'
  },
  // input form field container for text input field + the field label
  signUpInputFormFields: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20
  },
  // container of the sign up form
  signUpInputForm: {
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
  // text input fields for password and email
  signUpTextInput: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 15
  },
  // button to sign up
  signUpBtn: {
    width: '100%',
    backgroundColor: 'pink',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 20
  }
})
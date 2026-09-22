import { StyleSheet, 
         Text, 
         View, 
         TouchableOpacity, 
         TextInput, 
         ScrollView,
         ActivityIndicator } from 'react-native';
import { useState, useContext } from 'react'
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function SignUpScreen({navigation}){
  // state handling when the loading spinner should be shown
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { t, i18n } = useTranslation();
  const { signUp } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

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
        showErrorToast(t('signUpScreen.signUpFailed'), `${error.message ?? JSON.stringify(error)}`);
      }
    }
    setIsLoading(false);
  } 

  return(
    <ScrollView contentContainerStyle={[styles.signUpScrollViewContentContainer, 
                                        { paddingLeft: insets.left,
                                          paddingRight: insets.right }]}
                style={styles.signUpScreenScrollView}>
      <StatusBar style="auto" />
      <View style={[styles.signUpScreenContainer, { paddingBottom: insets.bottom + 50 }]}>
        {/* sign up form */}
        <View style={styles.signUpInputForm}>
          <Text>{insets.bot}</Text>
          {/* username input field */}
          <View style={styles.signUpInputFormFields}>
            <Text style={styles.inputFormLabelTxt}>Username</Text>
            <TextInput onChangeText={setUsername}
                        value={username}
                        style={styles.signUpTextInput} />
          </View>

          {/* email input field */}
          <View style={styles.signUpInputFormFields}>
            <Text style={styles.inputFormLabelTxt}>{t('authWords.email')}</Text>
            <TextInput onChangeText={setEmail}
                      value={email}
                      style={styles.signUpTextInput} />
          </View>

          {/* password input field */}
          <View style={styles.signUpInputFormFields}>
            <Text style={styles.inputFormLabelTxt}>{t('authWords.password')}</Text>
            <TextInput onChangeText={setPassword}
                      value={password}
                      style={styles.signUpTextInput} />
          </View>

          {/* button to sign up */}
          <TouchableOpacity onPress={() => {callSignUp()}}
                            style={styles.signUpBtn}>
            <Text style={styles.signUpBtnTxt}>
              {t('authWords.signUp')}
            </Text>
          </TouchableOpacity>

          <View style={styles.signInArea}>
            <Text style={styles.signInAreaTxt}>
              {t('signUpScreen.alreadyHaveAnAccount')}
            </Text>

            <TouchableOpacity onPress={() => {navigation.navigate('Sign In')}} >
              <Text style={[styles.signInAreaTxt, styles.signInHereTxt]}>
                {t('signUpScreen.signInHere')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {
          isLoading == true && (
            <LoadingOverlay />
          )
        }
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // scroll view container of the screen
  signUpScreenScrollView: {
    backgroundColor:'white',
    flex: 1,
    width: '100%'
  },
  signUpScrollViewContentContainer:{
    flexGrow: 1,
    height: '100%',
    backgroundColor: 'white'
  },
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
    maxWidth: 350
  },
  // text input fields for password and email
  signUpTextInput: {
    borderColor: 'lightgrey',
    borderWidth: 2,
    borderRadius: 20,
    width: '100%',
    elevation: 1,
    backgroundColor: 'white',
    color: '#2D3782',
    fontSize: 16,
    padding: 15
  },
  // label texts in input form
  inputFormLabelTxt: {
    color: '#2D3782',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 10
  },
  // button to sign up
  signUpBtn: {
    width: '100%',
    backgroundColor: '#2D3782',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    borderRadius: 20,
    marginVertical: 20
  },
  // text inside button for signing up
  signUpBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  // text inside sign in area
  signInAreaTxt: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2D3782'
  },
  // sign in here text 
  signInHereTxt: {
    textDecorationLine: 'underline',
    fontSize: 17,
    color: '#2D3782'
  },
  /* container of area for showing 'Already have an account?' text 
     and touchable opacity to sign in*/
  signInArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
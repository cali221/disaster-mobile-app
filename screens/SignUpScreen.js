import { StyleSheet, 
         Text, 
         View, 
         TouchableOpacity, 
         TextInput, 
         ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export function SignUpScreen({navigation}){
  // state handling when the loading spinner should be shown
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // function for handling signing up
  const signUp = async () => {
    setIsLoading(true);
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
      alert('error: ' + error.message);
    }
    else{
      alert('Account has been created.')
    }
    setIsLoading(false);
  } 

  return(
    <View style={styles.signUpScreenContainer}>
      {/* sign up form */}
      <View style={styles.signUpInputForm}>
        <View style={styles.signUpInputFormFields}>
          {/* email input field */}
          <Text>Email</Text>
          <TextInput onChangeText={setEmail}
                     value={email}
                     style={styles.signUpTextInput} />
        </View>

        <View style={styles.signUpInputFormFields}>
          {/* username input field */}
          <Text>Username</Text>
          <TextInput onChangeText={setUsername}
                     value={username}
                     style={styles.signUpTextInput} />
        </View>

        <View style={styles.signUpInputFormFields}>
          {/* password input field */}
          <Text>Password</Text>
          <TextInput onChangeText={setPassword}
                     value={password}
                     style={styles.signUpTextInput} />
        </View>

        {/* button to sign up */}
        <TouchableOpacity onPress={() => {signUp()}}
                          style={styles.signUpBtn}>
          <Text>
            Sign Up
          </Text>
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
import { Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast, showInfoToast } from '../utils/showToast';
import * as Notifications from 'expo-notifications';

// set how the notification should be shown if it happens while the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  })
});


export function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // state for user session
  const [session, setSession] = useState(null);
    
  // handle signing out user
  const signOut = async() => {
    const { error } = await supabase.auth.signOut();

    if(error){
      showErrorToast('Failed to sign out', error.message);
    }
  }
  
  useEffect(() => { 
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if(!session?.user || event === 'SIGNED_OUT'){
        setSession(null);
        navigation.popTo('Sign In')
      }
      else if(session?.user){
        setSession(session);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      showInfoToast('Notification detected', '');
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return(
    <View style={[styles.homescreenContainer, { paddingTop: insets.top,
                                                paddingBottom: insets.bottom,
                                                paddingLeft: insets.left,
                                                paddingRight: insets.right }]}>
      {session == null ? 
      // the components below are shown when user is not signed in
      <View>
        <Text>You are not logged in</Text>
        <TouchableOpacity onPress={()=>{navigation.navigate('Sign In')}}>
          <Text style={styles.signInLink}>Sign In Here</Text>
        </TouchableOpacity>
      </View> : 
      // the components below are shown when the user is signed in
      <View>
        <View style={styles.temporaryContent}>
          <Text>Welcome back</Text>
          <TouchableOpacity onPress={()=>{signOut()}}
                            style={styles.signOutBtn}>
            <Text>Sign out</Text>
          </TouchableOpacity>

          {/* button to go to watched areas settings, currently for adding watched areas */}
          <TouchableOpacity style={styles.accountSettingsBtn}
                            onPress={()=>{navigation.navigate('Watched Areas Settings', 
                                                              {'session': session})}}>
            <Text>Go to Watched areas settings</Text>
          </TouchableOpacity>
        </View>
      </View>   
    }
    </View>
  )
}

const styles = StyleSheet.create({
  // screen content container
  homescreenContainer:{
    width: '100%',
    height: '100%',
    padding: 30,
    backgroundColor: 'white'
  },
  /* container of temporary content, currently just 
     showing basic things for testing functionality */
  temporaryContent:{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    rowGap: 20
  },
  // button to go to watched areas settings screen
  accountSettingsBtn: {
    width: 170,
    backgroundColor: 'pink',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 20,
    marginBottom: 20
  },
  // overlay behind loading spinner
  loadingOverlay:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#0000008f',
    zIndex: 1,
 },
 // button for signing out
 signOutBtn: {
    width: 170,
    backgroundColor: 'lightgrey',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 20,
    marginBottom: 20
 },
 // link text to go to sign in screen
 signInLink: {
  textDecorationLine: 'underline'
 }
})
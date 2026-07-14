import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast, showInfoToast } from '../utils/showToast';
import * as Notifications from 'expo-notifications';
import { SignedOutContent } from '../components/SignedOutContent';
import { AuthContext } from '../contexts/AuthContext';

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
  const { user, signOut } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => { 
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
      {!user ? 
      // the components below are shown when user is not signed in
      <SignedOutContent navigation={navigation} originalScreen={'Home'} />
      : 
      // the components below are shown when the user is signed in
      <View>
        <View style={styles.temporaryContent}>
          <Text>Hi {user.user_metadata.username}</Text>

          {/* button to go to watched areas settings, currently for adding watched areas */}
          <TouchableOpacity style={styles.accountSettingsBtn}
                            onPress={()=>{navigation.navigate('Watched Areas Settings', 
                                                              {'session': session})}}>
            <Text>Go to Watched areas settings</Text>
          </TouchableOpacity>
        </View>
      </View>   
    }
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
import { createStackNavigator } from '@react-navigation/stack';
import { createStaticNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SignUpScreen } from './screens/SignUpScreen';
import { SignInScreen } from './screens/SignInScreen';
import { ProfileScreen} from './screens/ProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ResourceHubScreen } from './screens/ResourceHubScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PanicButtonScreen } from './screens/PanicButtonScreen';
import { WatchedAreasSettingsScreen } from './screens/WatchedAreasSettingsScreen';
import { View, StyleSheet, Text } from 'react-native';
import { House, UserRound, Bell, FileText, Siren } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthProvider from './contexts/AuthContext';
import { useContext } from 'react'; 
import { AuthContext } from './contexts/AuthContext';


const Stack = createStackNavigator();

// custom toast styling 
// styling should be applied directly without StyleSheet otherwise it doesn't work
const toastConfig = {
  customErrorToast: ({ text1, text2, props }) => (
    <View style={{ maxHeight: 350,
                   width: '100%', 
                   backgroundColor: 'white',
                   paddingHorizontal: 20,
                   paddingVertical: 10,
                   left: 0,
                   borderLeftColor: 'tomato',
                   borderLeftWidth: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{text1}</Text>
      <Text style={{ fontSize: 15 }}>{text2}</Text>
    </View>
  ),
  customInfoToast: ({ text1, text2, props }) => (
    <View style={{ maxHeight: 350,
                   width: '100%', 
                   backgroundColor: 'white',
                   paddingHorizontal: 20,
                   paddingVertical: 10,
                   left: 0,
                   borderLeftColor: 'cornflowerblue',
                   borderLeftWidth: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{text1}</Text>
      <Text style={{ fontSize: 15 }}>{text2}</Text>
    </View>
  ),
  customSuccessToast: ({ text1, text2, props }) => (
    <View style={{ maxHeight: 350,
                   width: '100%', 
                   backgroundColor: 'white',
                   paddingHorizontal: 20,
                   paddingVertical: 10,
                   left: 0,
                   borderLeftColor: 'limegreen',
                   borderLeftWidth: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{text1}</Text>
      <Text style={{ fontSize: 15 }}>{text2}</Text>
    </View>
  )
};

// NOTE: translation in screen titles is intentionally only given for some screens 
// for now since English words are anticipated to be more familiar digitally
// for the features compared to the Indonesian translation

// stack of screens for home screen
function homeScreenStack(){
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: true,     
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      } 
                                      }}>

        {user ? 
          (
            <>
              <Stack.Screen name='Home' 
                            component={HomeScreen} />
              
              <Stack.Screen name="Watched Areas Settings" 
                    component={WatchedAreasSettingsScreen}
                    options={{title: t('screenTitles.watchedAreasSettingsScreenTitle')}} />
            </>
          ) : 
          (
            <>
              <Stack.Screen name="Sign In" 
                      component={SignInScreen} 
                      options={{title: t('authWords.signIn')}} />

              <Stack.Screen name="Sign Up" 
                            component={SignUpScreen} 
                            options={{title: t('authWords.signUp')}} />
            </>
          )
        }
    </Stack.Navigator>
  );
}

// stack of screens for profile screens
function profileScreenStack(){
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  return(
    <Stack.Navigator screenOptions={{ headerShown: true,
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      } 
                                    }}>
        {user ? 
          (
            <>
              <Stack.Screen name='Profile' component={ProfileScreen} />
            </>
          ):
          (
            <>
              <Stack.Screen name="Sign In" 
                            component={SignInScreen} 
                            options={{title: t('authWords.signIn')}} />

              <Stack.Screen name="Sign Up" 
                            component={SignUpScreen} 
                            options={{title: t('authWords.signUp')}} />
            </>
          )
        }
    </Stack.Navigator>
  )
}

// stack of screens for panic button screens (currently planed to be just one screen)
function panicButtonScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true,
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      } 
                                    }}>
        <Stack.Screen name='Panic Button' component={PanicButtonScreen} />
    </Stack.Navigator>
  )
}

// stack of screens for notifications screen
function notificationScreenStack(){
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  
  return(
    <Stack.Navigator screenOptions={{ headerShown: true,
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      } 
                                   }}>
        {user ? 
          (
            <>
              <Stack.Screen name='Notifications' component={NotificationsScreen} />
            </>
          ):
          (
            <>
              <Stack.Screen name="Sign In" 
                            component={SignInScreen} 
                            options={{title: t('authWords.signIn')}} />

              <Stack.Screen name="Sign Up" 
                            component={SignUpScreen} 
                            options={{title: t('authWords.signUp')}} />
            </>
          )
        }
    </Stack.Navigator>
  )
}

// stack of screens for resource hub screen
function resourceHubScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true,
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      } 
                                   }}>
        <Stack.Screen name='Resource Hub' component={ResourceHubScreen} />
    </Stack.Navigator>
  )
}

// the bottom tab navigator
const bottomNavigationTabs = createBottomTabNavigator({
  // set styling
  screenOptions: ({ route }) => ({
    tabBarAccessibilityLabel: route.name,
    tabBarActiveTintColor: '#9ec110',
    tabBarInactiveTintColor: '#E0E0E0',
    tabBarStyle: {
      backgroundColor: '#2D3782',
      height: 120
    },
    /* to avoid warning about nested screens with same names, 
       use stack name and override labels on bottom tab */
    tabBarLabel: ({ focused, color, size }) => {
      if (route.name === 'Home Screen') {
        return(
          <Text style={[styles.bottomTabNavLabelTxts]}>Home</Text>
        )
      }
      else if (route.name === 'Profile Screen') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Profile</Text>
        )
      }
      else if (route.name === 'Resource Hub Screen') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Resources</Text>
        )
      }
      else if (route.name === 'Notifications Screen') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Notifications</Text>
        )
      }
    },
    // set icons/button for navigation
    tabBarIcon: ({ focused, color, size }) => {
      if (route.name === 'Home Screen') {
        return (
         <House fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Profile Screen'){
        return(
          <UserRound fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Notifications Screen'){
        return(
          <Bell fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Resource Hub Screen'){
        return(
          <FileText size={size} color='#2D3782' fill={color} />
        )
      }
      /* for panic button, use a view instead and hide label from tab navigator, 
         instead show the label through text inside view */
      else if(route.name == 'Panic Button Screen'){
        return(
          <View style={styles.panicButton}>
            <Siren size={35} color='#2D3782' />
            <Text style={styles.panicButtonTxt}>Panic{"\n"}Button</Text>
          </View>
        )
      }
    }
  }),
  screens: {
    'Home Screen': {
      screen: homeScreenStack,
      options: {
        headerShown: false
      }
    },
    'Resource Hub Screen': {
      screen: resourceHubScreenStack,
      options: {
        headerShown: false
      }
    },
    'Panic Button Screen': {
      screen: panicButtonScreenStack,
      options: {
        headerShown: false,
        tabBarLabel: () => null
      }
    },
    'Notifications Screen': {
      screen: notificationScreenStack,
      options: {
        headerShown: false
      }
    },
    'Profile Screen': {
      screen: profileScreenStack,
      options: {
        headerShown: false
      }
    }
  },
});

export const Navigation = createStaticNavigation(bottomNavigationTabs);

export default function App() {
  return(
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  panicButton:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9ec110',
    position: 'absolute',
    bottom: '3%',
    elevation: 3
  },
  panicButtonTxt: {
    textAlign: 'center',
    color: '#2D3782',
    fontSize: 12
  },
  bottomTabNavLabelTxts:{
    color: '#E0E0E0',
    textAlign: 'center',
    fontSize: 10
  },
  customToastView: {
     maxHeight: 350,
     width: '100%', 
     backgroundColor: 'white',
     paddingHorizontal: 20,
     paddingVertical: 10,
     left: 0,
     borderLeftColor: 'tomato',
     borderLeftWidth: 20
  },
  errorToastRedLeftBorder: {
    borderLeftColor: 'tomato',
    borderLeftWidth: 2
  },
  infoToastBlueLeftBorder: {
    borderLeftColor: 'cornflowerblue',
    borderLeftWidth: 2
  },
  successToastGreenLeftBorder: {
    borderLeftColor: 'limegreen',
    borderLeftWidth: 2
  }
})
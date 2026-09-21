import { createStackNavigator } from '@react-navigation/stack';
import { createStaticNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { House, UserRound, Bell, FileText, Siren, VolumeOffIcon, Volume2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthProvider from './contexts/AuthContext';
import LanguageProvider from './contexts/LanguageContext';
import { useContext } from 'react'; 
import { AuthContext } from './contexts/AuthContext';

// ----- Screen Imports -----
// authentication/users related screens imports:
import { SignUpScreen } from './screens/users-related-screens/SignUpScreen';
import { SignInScreen } from './screens/users-related-screens/SignInScreen';
import { AccountSettingsScreen } from './screens/users-related-screens/AccountSettingsScreen';
import { WatchedAreasSettingsScreen } from './screens/users-related-screens/WatchedAreasSettingsScreen';
import { FollowingFollowersScreen } from './screens/users-related-screens/FollowingFollowersScreen';
import { FindUsersScreen } from './screens/users-related-screens/FindUsersScreen';
import { LeaderboardScreen } from './screens/users-related-screens/LeaderboardScreen';
import { ProfileOfAnotherUserScreen } from './screens/users-related-screens/ProfileOfAnotherUserScreen'; 

// main screens imports:
import { ProfileScreen} from './screens/ProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ResourceHubScreen } from './screens/ResourceHubScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PanicButtonScreen } from './screens/PanicButtonScreen';

// disaster details screens imports:
import { DisasterDetailsScreen } from './screens/disasters-details-screens/DisasterDetailsScreen';

// resources screens imports:
import { UsefulLocationScreen } from './screens/resources-screens/UsefulLocationScreen';
import { EmergencyNumbersScreen } from './screens/resources-screens/EmergencyNumbersScreen';

// disaster guides screens imports:
import { EarthquakeGuideScreen } from './screens/resources-screens/disaster-guides/EarthquakeGuideScreen';
import { TsunamiGuideScreen } from './screens/resources-screens/disaster-guides/TsunamiGuideScreen';
import { FloodGuideScreen } from './screens/resources-screens/disaster-guides/FloodGuideScreen';
import { LandslideGuideScreen } from './screens/resources-screens/disaster-guides/LandslideGuideScreen';
import { VolcanicEruptionGuideScreen } from './screens/resources-screens/disaster-guides/VolcanicEruptionGuideScreen';

// crowdsourced reports screens imports:
import { ReportMenuScreen } from './screens/crowdsourced-reports-screens/ReportMenuScreen';
import { ReportFormScreen } from './screens/crowdsourced-reports-screens/ReportFormScreen';

// gamification screens imports
import { QuizzesScreen } from './screens/gamification-screens/QuizzesScreen';
import { FlashcardsScreen } from './screens/gamification-screens/FlashcardsScreen';
import { EmergencyBagScreen } from './screens/gamification-screens/EmergencyBagScreen';

// header button components imports
import { LanguageChangeButton } from './components/LanguageChangeButton';
import { MuteUnmuteButton } from './components/MuteUnmuteButton';

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
                                      },
                                      headerRight: () => (
                                        <LanguageChangeButton />
                                      ), 
                                      }}>

        {user ? 
          (
            <>
              <Stack.Screen name='Home' 
                            component={HomeScreen}
                            options={{title: t('screenTitles.home')}} />
                        
              <Stack.Screen name='Disaster Details'
                            component={DisasterDetailsScreen}
                            options={{title: t('screenTitles.disasterDetailsScreenTitle')}} /> 

              <Stack.Screen name='Report Menu'
                            component={ReportMenuScreen}
                            options={{title: t('screenTitles.reportMenuScreenTitle')}} />

              <Stack.Screen name='Report Form'
                            component={ReportFormScreen}
                            options={{title: t('screenTitles.reportFormScreenTitle')}} />

              <Stack.Screen name='Quizzes'
                            component={QuizzesScreen}
                            options={{title: t('screenTitles.quizzesScreenTitle')}} />

              <Stack.Screen name='Flashcards'
                            component={FlashcardsScreen} />

              <Stack.Screen name='Emergency Bag'
                            component={EmergencyBagScreen}
                            options={{title: t('screenTitles.emergencyBagScreenTitle')}} />
              
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
                                      },
                                      headerRight: () => (
                                        <LanguageChangeButton />
                                      )
                                    }}>
        {user ? 
          (
            <>
              <Stack.Screen name='Profile' 
                            component={ProfileScreen} 
                            options={{title: t('screenTitles.profile')}} />

              {/* handle screen titles in Profile screen based on route.params */}
              <Stack.Screen name='Profile of Another User' 
                            component={ProfileOfAnotherUserScreen}
                            options={({ route }) => ({
                              title: route.params.screenTitle,
                            })} />

              <Stack.Screen name='Account Settings' 
                            component={AccountSettingsScreen} 
                            options={{title: t('screenTitles.accountSettingsScreenTitle')}} />

              {/* handle screen titles in Profile screen based on route.params */}
              <Stack.Screen name='Following/Followers' 
                            component={FollowingFollowersScreen}
                            options={({ route }) => ({
                              title: route.params.screenTitle,
                            })} />

              <Stack.Screen name='Find Users' 
                            component={FindUsersScreen}
                            options={{title: t('screenTitles.findUsersScreenTitle')}} />

              <Stack.Screen name='Leaderboard' 
                            component={LeaderboardScreen} />
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
                                      },
                                      headerRight: () => (
                                        <LanguageChangeButton />
                                      ) 
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
                                      },
                                      headerRight: () => (
                                        <LanguageChangeButton />
                                      ) 
                                   }}>
        {user ? 
          (
            <>
              <Stack.Screen name='Notifications' 
                            component={NotificationsScreen} 
                            options={{title: t('screenTitles.notifications')}} />
              <Stack.Screen name='Disaster Details' component={DisasterDetailsScreen} />
              <Stack.Screen name='Report Form'
                            component={ReportFormScreen}
                            options={{title: t('screenTitles.reportFormScreenTitle')}} />
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
  const { t, i18n } = useTranslation();
  return(
    <Stack.Navigator screenOptions={{ headerShown: true,
                                      headerStyle: {
                                        backgroundColor: '#2D3782',
                                      },
                                      headerTintColor: '#ffffff',
                                      headerTitleStyle: {
                                          fontWeight: 'bold',
                                      },
                                      headerRight: () => (
                                        <LanguageChangeButton />
                                      ) 
                                   }}>
        <Stack.Screen name='Resource Hub' 
                      component={ResourceHubScreen} />

        <Stack.Screen name='Emergency Numbers' 
                      component={EmergencyNumbersScreen}
                      options={{title: t('screenTitles.emergencyNumbersScreenTitle')}} />

        <Stack.Screen name='Useful Locations'
                      component={UsefulLocationScreen}
                      options={{title: t('screenTitles.usefulLocationScreenTitle')}} />

        <Stack.Screen name='Earthquake Guide'
                      component={EarthquakeGuideScreen}
                      options={{title: t('screenTitles.earthquakeGuideScreenTitle')}} />

        <Stack.Screen name='Tsunami Guide'
                      component={TsunamiGuideScreen}
                      options={{title: t('screenTitles.tsunamiGuideScreenTitle')}} />

        <Stack.Screen name='Flood Guide'
                      component={FloodGuideScreen}
                      options={{title: t('screenTitles.floodGuideScreenTitle')}} />

        <Stack.Screen name='Landslide Guide'
                      component={LandslideGuideScreen}
                      options={{title: t('screenTitles.landslideGuideScreenTitle')}} />

        <Stack.Screen name='Volcanic Eruption Guide'
                    component={VolcanicEruptionGuideScreen}
                    options={{title: t('screenTitles.volcanicEruptionsGuideScreenTitle')}} />
    </Stack.Navigator>
  )
}

// the bottom tab navigator
const bottomNavigationTabs = createBottomTabNavigator({
  // set styling
  screenOptions: ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: '#9ec110',
    tabBarInactiveTintColor: '#E0E0E0',
    tabBarStyle: {
      backgroundColor: '#2D3782',
      height: 120
    },
    // Note: tab bar navigation buttons' accessibility label follow these labels
    // except for panic button where the accessiblity label is 'Panic Button (Tombol Panik)' 
    tabBarLabel: ({ focused, color, size }) => {
      const { t, i18n } = useTranslation();

      if (route.name === 'Home Screen Stack') {
        return(
          <Text style={[styles.bottomTabNavLabelTxts]}>{t('tabBarLabels.home')}</Text>
        )
      }
      else if (route.name === 'Profile Screen Stack') {
        return(
           <Text style={[styles.bottomTabNavLabelTxts]}>{t('tabBarLabels.profile')}</Text>
        )
      }
      else if (route.name === 'Resource Hub Screen Stack') {
        return(
          <Text style={[styles.bottomTabNavLabelTxts]}>{t('tabBarLabels.resourceHub')}</Text>
        )
      }
      else if (route.name === 'Notifications Screen Stack') {
        return(
          <Text style={[styles.bottomTabNavLabelTxts]}>{t('tabBarLabels.notifications')}</Text>
        )
      }
      else if (route.name == 'Panic Button Screen Stack'){
        return null
      }
    },
    // set icons/button for navigation
    tabBarIcon: ({ focused, color, size }) => {
      if (route.name === 'Home Screen Stack') {
        return (
         <House fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Profile Screen Stack'){
        return(
          <UserRound fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Notifications Screen Stack'){
        return(
          <Bell fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Resource Hub Screen Stack'){
        return(
          <FileText size={size} color='#2D3782' fill={color} />
        )
      }
      /* for panic button, use a view instead and hide label from tab navigator, 
         instead show the label through text inside view */
      else if(route.name == 'Panic Button Screen Stack'){
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
    'Home Screen Stack': {
      screen: homeScreenStack
    },
    'Resource Hub Screen Stack': {
      screen: resourceHubScreenStack
    },
    'Panic Button Screen Stack': {
      screen: panicButtonScreenStack,
      // because tab bar label is not specified, specify accessibility label here
      options: {
        tabBarAccessibilityLabel: 'Panic Button (Tombol Panik)'
      }
    },
    'Notifications Screen Stack': {
      screen: notificationScreenStack
    },
    'Profile Screen Stack': {
      screen: profileScreenStack
    }
  },
});

export const Navigation = createStaticNavigation(bottomNavigationTabs);

export default function App() {
  return(
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
            <Navigation />
            <Toast config={toastConfig} />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  // the panic button in the middle of the bottom tab bar
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
  // text inside panic button
  panicButtonTxt: {
    textAlign: 'center',
    color: '#2D3782',
    fontSize: 12,
    fontWeight: '600'
  },
  /* label texts for bottom tab bar 
     buttons (except for the panic button) */
  bottomTabNavLabelTxts:{
    color: '#E0E0E0',
    textAlign: 'center',
    fontSize: 10
  }
});
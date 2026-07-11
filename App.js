import { createStackNavigator } from '@react-navigation/stack';
import { createStaticNavigation } from '@react-navigation/native';
import { SignUpScreen } from './screens/SignUpScreen';
import { SignInScreen } from './screens/SignInScreen';
import { ProfileScreen} from './screens/ProfileScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ResourceHubScreen } from './screens/ResourceHubScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PanicButtonScreen } from './screens/PanicButtonScreen';
import { WatchedAreasSettingsScreen } from './screens/WatchedAreasSettingsScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import { House, UserRound, Bell, FileText, Siren, FileX } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();

// stack of screens for home screen
function homeScreenStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name='Home'component={HomeScreen} />
      <Stack.Screen name="Sign In" component={SignInScreen}></Stack.Screen>
      <Stack.Screen name="Sign Up" component={SignUpScreen}></Stack.Screen>
      {/* move to Profile screen stack later, possibly remove & replace with modal*/}
      <Stack.Screen name="Watched Areas Settings" component={WatchedAreasSettingsScreen}></Stack.Screen>

      {/* TODO: add gamification and other related screens here  */}
    </Stack.Navigator>
  );
}

// stack of screens for profile screens
function profileScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name='Profile' component={ProfileScreen} />
    </Stack.Navigator>
  )
}

// stack of screens for panic button screens (currently planed to be just one screen)
function panicButtonScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name='Panic Button' component={PanicButtonScreen} />
    </Stack.Navigator>
  )
}

// stack of screens for notifications screen
function notificationScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name='Notifications' component={NotificationsScreen} />
    </Stack.Navigator>
  )
}

// stack of screens for resource hub screen
function resourceHubScreenStack(){
  return(
    <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name='Resource Hub' component={ResourceHubScreen} />
    </Stack.Navigator>
  )
}

// the bottom tab navigator
const bottomNavigationTabs = createBottomTabNavigator({
  // set styling
  screenOptions: ({ route }) => ({
    tabBarActiveTintColor: '#9ec110',
    tabBarInactiveTintColor: '#E0E0E0',
    tabBarStyle: {
      backgroundColor: '#2D3782'
    },
    /* to avoid warning about nested screens with same names, 
       use stack name and override labels on bottom tab */
    tabBarLabel: ({ focused, color, size }) => {
      if (route.name === 'Home Stack') {
        return(
          <Text style={[styles.bottomTabNavLabelTxts]}>Home</Text>
        )
      }
      else if (route.name === 'Profile Stack') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Profile</Text>
        )
      }
      else if (route.name === 'Resource Hub Stack') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Resource Hub</Text>
        )
      }
      else if (route.name === 'Notifications Stack') {
        return(
          <Text style={styles.bottomTabNavLabelTxts}>Notifications</Text>
        )
      }
    },
    // set icons/button for navigation
    tabBarIcon: ({ focused, color, size }) => {
      if (route.name === 'Home Stack') {
        return (
         <House fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Profile Stack'){
        return(
          <UserRound fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Notifications Stack'){
        return(
          <Bell fill={color} size={size} color={color} />
        )
      }
      else if(route.name == 'Resource Hub Stack'){
        return(
          <FileText size={size} color='#2D3782' fill={color} />
        )
      }
      /* for panic button, use a view instead and hide label from tab navigator, 
         instead show the label through text inside view */
      else if(route.name == 'Panic Button Stack'){
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
    'Home Stack': {
      screen: homeScreenStack,
      options: {
        headerShown: false
      }
    },
    'Resource Hub Stack': {
      screen: resourceHubScreenStack,
      options: {
        headerShown: false
      }
    },
    'Panic Button Stack': {
      screen: panicButtonScreenStack,
      options: {
        headerShown: false,
        tabBarLabel: () => null
      }
    },
    'Notifications Stack': {
      screen: notificationScreenStack,
      options: {
        headerShown: false
      }
    },
    'Profile Stack': {
      screen: profileScreenStack,
      options: {
        headerShown: false
      }
    }
  },
});

const Navigation = createStaticNavigation(bottomNavigationTabs);

export default function App() {
  return(
    <SafeAreaProvider>
      <Navigation />
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
    fontSize: 11
  }
})
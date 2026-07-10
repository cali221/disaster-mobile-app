import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SignUpScreen } from './screens/SignUpScreen';
import { SignInScreen } from './screens/SignInScreen';
import { HomeScreen } from './screens/HomeScreen';
import { AccountSettingsScreen } from './screens/AccountSettings';

const Stack = createStackNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen}></Stack.Screen>
        <Stack.Screen name="Sign In" component={SignInScreen}></Stack.Screen>
        <Stack.Screen name="Sign Up" component={SignUpScreen}></Stack.Screen>
        <Stack.Screen name="Account Settings" component={AccountSettingsScreen}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

import { Text, View, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { SignedOutContent } from '../components/SignedOutContent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';

export function NotificationsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    return(
        <View style={[styles.notificationScreenContainer, { paddingTop: insets.top,
                                                            paddingBottom: insets.bottom,
                                                            paddingLeft: insets.left,
                                                            paddingRight: insets.right }]}>
            {!user ? 
            // the components below are shown when user is not signed in
            <SignedOutContent navigation={navigation} originalScreen={'Notifications'} />
            : 
            // the components below are shown when the user is signed in
            <View>
                <Text>Notification Screen Placeholder</Text>
            </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    notificationScreenContainer: {
        width: '100%',
        height: '100%',
        padding: 30,
        backgroundColor: 'white'
    }
})
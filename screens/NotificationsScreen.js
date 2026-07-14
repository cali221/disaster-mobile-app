import { Text, View, StyleSheet } from 'react-native';
import { useContext } from 'react';
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
            {
                user && (
                    <View>
                        <Text>Notification Screen Placeholder</Text>
                    </View>
                )
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
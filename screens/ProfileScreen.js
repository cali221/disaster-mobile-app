import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';

export function ProfileScreen({ navigation }) {
    const { user, signOut } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const insets = useSafeAreaInsets();

    const callSignOut = async () => {
        setIsLoading(true);
        try{
          await signOut();
        }
        catch(error){
          showErrorToast('Failed to sign out', error.message ?? error);
        }
        setIsLoading(false);
    }

    return(
        <View style={[styles.notificationScreenContainer, { paddingTop: insets.top,
                                                            paddingBottom: insets.bottom,
                                                            paddingLeft: insets.left,
                                                            paddingRight: insets.right }]}>
            {
                user && (
                     <View>
                        <Text>Profile Screen Placeholder</Text>
                        <Text>{user?.user_metadata.username}</Text>
                        <TouchableOpacity onPress={()=>{callSignOut()}}
                                                    style={styles.signOutBtn}>
                            <Text>Sign out</Text>
                        </TouchableOpacity>
                    </View>
                )
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
    notificationScreenContainer: {
        width: '100%',
        height: '100%',
        padding: 30,
        backgroundColor: 'white'
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
})
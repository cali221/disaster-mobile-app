import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ActivityIndicator, 
         ScrollView } from 'react-native';
import { useContext, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';

export function ProfileScreen({ navigation }) {
    const { user, signOut } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    // temporary function just for checking if things work as expected
    const changeLang = () => {
        i18n.changeLanguage('id');
    }

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
        <ScrollView style={[styles.notificationScreenContainer, { paddingLeft: insets.left,
                                                                  paddingRight: insets.right }]}>
          
            <View style={{width: '100%', height: 250, backgroundColor: 'limegreen', marginBottom: 30}} />
            <View style={{width: '100%', height: 250, backgroundColor: 'limegreen', marginBottom: 30}} />
            <View style={{width: '100%', height: 250, backgroundColor: 'limegreen', marginBottom: 30}} />


            
            <View>
                <Text>Profile Screen Placeholder</Text>
                <Text>{user?.user_metadata.username}</Text>
                <TouchableOpacity onPress={()=>{callSignOut()}}
                                            style={styles.signOutBtn}>
                    <Text>Sign out</Text>
                </TouchableOpacity>

                {/* temporary button just for checking if things work as expected */}
                <TouchableOpacity onPress={()=>{changeLang()}}>
                    <Text>Try to switch language to Indonesian</Text>
                </TouchableOpacity>
            </View>
            
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </ScrollView>
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
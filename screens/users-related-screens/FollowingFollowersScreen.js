import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export function FollowingFollowersScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.listScrollView}
                        contentContainerStyle={styles.listScrollViewContentContainer}>
                {/* placeholders, to be replaced with actual following/followers info. */}
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
            </ScrollView>

            {/* container of the button to find other users, 'sticky' at the bottom of screen */}
            <View style={[styles.findUsersBtnContainer, {paddingBottom: insets.bottom}]}>
                {/* button to find other users */}
                <TouchableOpacity style={styles.findUsersBtn}
                                  accessibilityRole='button'
                                  accessibilityLabel={'followingFollowersScreen.findUserBtnAccLbl'}
                                  onPress={()=>{navigation.navigate('Find Users')}}>
                    <Text style={styles.findUsersBtnTxt}>
                        {t('followingFollwersScreen.findUsersToFollowBtnTxt')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    // the screen container
    screenContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        alignContent: 'space-between'
    },
    // the scroll view for showing following/followers list
    listScrollView: {
        backgroundColor: 'white',
        width: '100%'
    },
    /* content container inside the scroll view for 
       showing following/followers list */
    listScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        padding: 30
    },
    /* container of the find users to follow button 
       at bottom of screen ('sticky') */
    findUsersBtnContainer: {
        backgroundColor: 'white',
        height: 200,
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the 'Find Users to Follow' button
    findUsersBtn: {
        backgroundColor: '#2D3782',
        height: 50, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        minWidth: 170
    },
    // the text inside the 'Find Users to Follow' button
    findUsersBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 17
    }
});
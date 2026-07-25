import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ActivityIndicator, 
         ScrollView } from 'react-native';
import { useContext, useEffect, useState, useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { showErrorToast } from '../utils/show-toast';
import { getFollowersCount, getFollowingCount } from '../utils/users-utilities';
import { useIsFocused } from '@react-navigation/native';

export function ProfileScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const isFocused = useIsFocused();
    const { user, signOut } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage);
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const insets = useSafeAreaInsets();

    // handle language change
    const handleLangChange = (langCode) => {
        try{
            if(langCode != 'en' && langCode != 'id'){
                throw new Error(`${t('profileScreen.unrecognizedLangCodeError')}`)
            }

            i18n.changeLanguage(langCode);
            setCurrentLang(langCode);
        }
        catch(error){
            showErrorToast(t('profileScreen.failedToChangeLang'), `${error.message ?? error}`);
        }  
    };

    // handle signing out
    const callSignOut = async () => {
        setIsLoading(true);
        try{
          await signOut();
        }
        catch(error){
          showErrorToast('Failed to sign out', `${error.message ?? error}`);
        }
        setIsLoading(false);
    };

    useEffect(()=>{
        // handle getting followers and following count
        const getFollowingAndFollowersCount = async (userId) => {
            try{
                const followersCount = await getFollowersCount(userId);
                if(followersCount){
                    setFollowersCount(followersCount);
                }

                const followingCount = await getFollowingCount(userId);
                if(followingCount){
                    setFollowingCount(followingCount);
                }
            }
            catch(error){
                showErrorToast(t('profileScreen.failedToFetchFollowingOrFollowersCount'), 
                            `${error.message ?? error}`);
            }
        };

        /* fetch following and followers count if there is 
           logged in user and screen is in focus */
        if(user && isFocused == true){
            getFollowingAndFollowersCount(user.id);
        }
    }, [user, isFocused])

    return(
        <ScrollView style={[styles.notificationScreenContainer, { paddingLeft: insets.left,
                                                                  paddingRight: insets.right }]}
                    contentContainerStyle={[styles.screenScrollContainerContent, {paddingBottom: insets.bottom + 80}]}>
          
            <Text style={styles.keepPracticingTxt}>
                {(t('profileScreen.keepPracticingTxt'))}
            </Text>

            {/* placeholder view */}
            <View style={{width: 200, height: 200, backgroundColor: 'plum'}} />
           
            {/* username */}
            <Text style={styles.usernameTxt}>
                @{user?.user_metadata.username}
            </Text>

            {/* following and followers buttons with the following/followers count */}
            <View style={styles.followingFollowersBtnsContainer}>
                <TouchableOpacity style={styles.followingFollowersBtns}
                                  onPress={()=>{
                                    navigation.navigate('Following/Followers', 
                                                        {
                                                            screenTitle: t('profileScreen.following'),
                                                            userId: user.id
                                                        })
                                  }}>
                    <Text style={styles.followingFollowersBtnsTxt}>
                        {followingCount} {t('profileScreen.following')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.followingFollowersBtns}
                                  onPress={()=>{
                                    navigation.navigate('Following/Followers', 
                                                        {
                                                            screenTitle: t('profileScreen.followers'),
                                                            userId: user.id
                                                        })
                                  }}>
                    <Text style={styles.followingFollowersBtnsTxt}>
                       {followersCount} {t('profileScreen.followers')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* buttons at the bottom of the screen: 
               - account settings
               - button to change language 
               - button to sign out */}
            <View style={styles.bottomButtonsContainer}>
                {/* button for changing language
                    if current language is English, show button to change language to Indonesian,
                    if current language is Indonesian, show button to change language to English */}
                {
                    currentLang == 'en' ? 
                    (
                        <TouchableOpacity onPress={()=>{handleLangChange('id')}}
                                          style={[styles.bottomButtonsBase, styles.changeLangButtonColor]}>
                            <Text style={[styles.bottomButtonTextBase, styles.changeLangButtonTxtColor]}>
                                {t('profileScreen.changeLangToId')}
                            </Text>
                        </TouchableOpacity>
                        
                    ):
                    currentLang == 'id' &&
                    (
                        <TouchableOpacity onPress={()=>{handleLangChange('en')}}
                                          style={[styles.bottomButtonsBase, styles.changeLangButtonColor]}>
                            <Text style={[styles.bottomButtonTextBase, styles.changeLangButtonTxtColor]}>
                                {t('profileScreen.changeLangToEn')}
                            </Text>
                        </TouchableOpacity>
                    )
                }

                {/* button to go to account settings screen*/}
                <TouchableOpacity onPress={()=>{navigation.navigate('Account Settings')}}
                                  style={[styles.bottomButtonsBase, styles.accountSettingsBtnColor]}
                                  accessibilityRole='button'>
                    <Text style={[styles.bottomButtonTextBase, styles.accountSettingsBtnTxtColor]}>
                       {t('profileScreen.accountSettingsBtnTxt')}
                    </Text>
                </TouchableOpacity>

                {/* button for signing out */}
                <TouchableOpacity onPress={()=>{callSignOut()}}
                                  style={[styles.bottomButtonsBase, styles.signOutBtnColor]}
                                  accessibilityRole='button'>
                    <Text style={[styles.bottomButtonTextBase, styles.signOutBtnTxtColor]}>
                        {t('profileScreen.signOutBtnTxt')}
                    </Text>
                </TouchableOpacity>
            </View>
        
            {/* loading indicator to show when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    // screen scroll view container
    notificationScreenContainer: {
        width: '100%',
        backgroundColor: 'white'
    },
    // content container of the screen container scroll view
    screenScrollContainerContent: { 
        padding: 30,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        rowGap: 20
    },
    // keep practicing explanation text
    keepPracticingTxt: {
        textAlign: 'center',
        color: '#535353'
    },
    // the username text
    usernameTxt: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3782',
        textAlign: 'center'
    },
    // container of the following and followers buttons
    followingFollowersBtnsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        columnGap: 35,
        width: '100%'
    },
    // the following/followers buttons
    followingFollowersBtns: {
        backgroundColor: '#9ec110',
        width: '40%',
        maxWidth: 250,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the text inside the following/followers buttons
    followingFollowersBtnsTxt: {
        fontWeight: '600',
        fontSize: 15,
        color: '#2D3782'
    },
    /* container of the buttons at the bottom of the screen
       (sign out button, change language button and account settings button) */
    bottomButtonsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 20,
        width: '100%'
    },
    /* base styling of the buttons at the bottom of the screen 
       (sign out button, change language button and account settings button) */
    bottomButtonsBase: {
        width: '100%',
        backgroundColor: '#9ec110',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        borderRadius: 25,
        elevation: 2,
        maxWidth: 550
    },
    /* base styling of the text inside the buttons at the bottom of the screen
       (sign out button, change language button and account settings button) */
    bottomButtonTextBase: {
        fontWeight: '600',
        fontSize: 15
    },
    // color of the change language button
    changeLangButtonColor: {
        backgroundColor: '#9ec110',
    },
    // color of the text inside the change language button
    changeLangButtonTxtColor: {
        color: '#2D3782'
    },
    // color of the sign out button
    signOutBtnColor: {
        backgroundColor: '#D2DAE4',
    },
    // color of the text inside the sign out button
    signOutBtnTxtColor: {
        color: '#2D3782'
    },
    // color of the button to go to the account settings screen
    accountSettingsBtnColor: {
        backgroundColor:  '#2D3782'
    },
    // color of the text inside the button to go to the account settings screen
    accountSettingsBtnTxtColor: {
        color: 'white'
    }
})
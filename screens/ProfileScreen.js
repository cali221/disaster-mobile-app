import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView,
         Image } from 'react-native';
import { useContext, useEffect, useState, useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { showErrorToast } from '../utils/show-toast';
import { getUserProfileData } from '../utils/users-utilities';
import { useIsFocused } from '@react-navigation/native';
import { UserProfilePicture } from '../components/UserProfilePicture';

export function ProfileScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const isFocused = useIsFocused();
    const { user, signOut } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false)
    const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage);
    const [userProfile, setUserProfile] = useState(null);
    
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
        // function to handle getting profile data of user
        const getProfileData = async(userId) => {
            try{
                const fetchedUserData = await getUserProfileData(userId);

                /* set user profile state using the fetched data with sorted badges array 
                   where earned badges occupy the first indexes */
                setUserProfile({...fetchedUserData,  
                                user_badges: fetchedUserData.user_badges.sort((a, b)=> b.earned - a.earned)});
            }
            catch(error){
                showErrorToast(t('profileScreen.failedToFetchUserData'), `${error.message ?? error}`)
            }
        };

        /* fetch user profile data and sort badges array */
        if(user && isFocused == true){
            getProfileData(user.id);
        }
    }, [user, isFocused])
    
    return(
        <ScrollView style={[styles.notificationScreenContainer, { paddingLeft: insets.left,
                                                                  paddingRight: insets.right }]}
                    contentContainerStyle={[styles.screenScrollContainerContent, {paddingBottom: insets.bottom + 80}]}>

            <View style={styles.contentWrapper}>
            {
                userProfile ? (
                    // if profile data is available display them
                    <View style={styles.profileInfoContainer}> 
                        {/* explanation text about flashcards and avatar's armor condition */}
                        <Text style={styles.keepPracticingTxt}>
                            {(t('profileScreen.keepPracticingTxt'))}
                        </Text>

                        {/* use profile picture with round background and avatar */}
                        <UserProfilePicture imgUrl={userProfile?.avatar_img_url} 
                                            width={200} 
                                            height={200} 
                                            bgColor='#D2DAE4' />
                    
                        {/* username */}
                        <Text style={styles.usernameTxt}>
                            @{userProfile.username ?? 'Unknown User'}
                        </Text>

                        {/* following and followers buttons with the following/followers count */}
                        <View style={styles.followingFollowersBtnsContainer}>
                            {/* following button */}
                            <TouchableOpacity style={styles.followingFollowersBtns}
                                            onPress={()=>{
                                                navigation.navigate('Following/Followers', 
                                                                    {
                                                                        screenTitle: t('profileScreen.following'),
                                                                        userId: user.id
                                                                    })
                                            }}>
                                <Text style={styles.followingFollowersBtnsTxt}>
                                    {userProfile?.following_count} {t('profileScreen.following')}
                                </Text>
                            </TouchableOpacity>

                            {/* followers count */}
                            <TouchableOpacity style={styles.followingFollowersBtns}
                                            onPress={()=>{
                                                navigation.navigate('Following/Followers', 
                                                                    {
                                                                        screenTitle: t('profileScreen.followers'),
                                                                        userId: user.id
                                                                    })
                                            }}>
                                <Text style={styles.followingFollowersBtnsTxt}>
                                    {userProfile?.followers_count} {t('profileScreen.followers')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* level/league and xp overview */}
                        <View style={styles.levelXpOverviewSection}>
                            {/* league/level image */}
                            <Image source={{uri: userProfile.level_img_url}} style={styles.levelImg} />

                            {/* text container */}
                            <View style={styles.levelXpOverviewTextContainer}>
                                {/* user level/league name */}
                                <Text style={styles.levelNameTxt}>
                                    {userProfile.level_name}
                                </Text>

                                {/* user XP */}
                                <Text style={styles.totalXpTxt}>
                                    Total XP: {userProfile.xp}
                                </Text>
                            </View>
                        </View>

                        {/* badges section */}
                        <View style={styles.badgesSection}>
                            <View style={styles.badgesSectionHeader}>
                                {/* badges section headiing text */}
                                <Text style={styles.badgesHeadingTxt}>
                                    {t('profileScreen.badges')}
                                </Text>
                            </View>

                            {/* horizontal scroll view for showing badges */}
                            <ScrollView style={styles.badgesScrollView}
                                        horizontal={true}
                                        contentContainerStyle={styles.badgesScrollViewContentContainer}>
                                {
                                    (userProfile?.user_badges?.map((item, index) => {
                                        return(
                                            // badge item container with badge image and name
                                            <View key={index} style={styles.badgeItemContainer}>
                                                {/* the badge image, grayscale if unearned */}
                                                <Image source={{uri: item.badgeImgUrl}} style={[styles.badgeImg, 
                                                                                                item.earned == false && {filter: 'grayscale(100%)'}]}/>
                                                {/* the badge name */}
                                                <Text style={styles.badgeNameTxt}>{item.name}</Text>
                                            </View>
                                        )
                                    }))
                                }
                            </ScrollView>
                        </View>
                    </View>
                ) :
                (
                    // text shown when fetchig user profile data failed
                    <Text style={styles.failedToFetchUserDataText}>
                        {t('profileScreen.failedToFetchUserData')}
                    </Text>
                )
            }

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
            </View>
            {/* loading indicator to show when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    // screen scroll view container
    notificationScreenContainer: {
        width: '100%',
        backgroundColor: 'white',
    },
    // content container of the screen container scroll view
    screenScrollContainerContent: { 
        padding: 30,
        display: 'flex',
        alignItems: 'center',
        rowGap: 20
    },
    // content wrapper inside the scroll view
    contentWrapper: {
        display: 'flex', 
        justifyContent: 'center', 
        maxWidth: 550,
        width: '100%',
        rowGap: 20
    },
    // container of section containing user information
    profileInfoContainer: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        rowGap: 20,
        width: '100%'
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
        justifyContent: 'space-between',
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
    },
    // text shown when fetching user data failed
    failedToFetchUserDataText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // the badges section container
    badgesSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },
    /* the header of the badges section with the section 
       heading and the View All link/button */
    badgesSectionHeader: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    // the container of the badges scroll view content
    badgesScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        flex: 1,
        flexWrap: 'nowrap',
        overflow: 'auto',
        columnGap: 20,
    },
    // scroll view for showing badges
    badgesScrollView: {
        width: '100%'
    },
    // container of each badge item
    badgeItemContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the badge image
    badgeImg: {
        flex: 1,
        width: 110,
        height: 110,
        resizeMode: 'cover',
        elevation: 5
    },
    // heading text of badges section
    badgesHeadingTxt: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3782'
    },
    // text showing each badge's name
    badgeNameTxt: {
        fontSize: 15,
        color: '#2D3782'
    },
    // section container for XP and level overview
    levelXpOverviewSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 50,
        borderRadius: 20,
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2
    },
    // the level/league image
    levelImg: {
        width: 100,
        height: 100,
        resizeMode: 'cover'
    },
    // container of texts in the level and XP overview section
    levelXpOverviewTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the text showing the level/league name
    levelNameTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // the text showing total XP
    totalXpTxt: {
        fontSize: 15,
        color: '#2D3782'
    }
});
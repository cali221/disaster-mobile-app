import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView,
         RefreshControl,
         TextInput } from 'react-native';
import { useContext, useEffect, useState, useCallback  } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { showErrorToast } from '../utils/show-toast';
import { getLeaderboard } from '../utils/users-utilities';
import { useIsFocused } from '@react-navigation/native';
import { UserProfilePicture } from '../components/UserProfilePicture';
import { ChevronRight, RotateCw } from 'lucide-react-native';
import { BottomModalBase } from '../components/modals-base/BottomModalBase';
import { supabase } from '../lib/supabase';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTrustedContacts } from '../utils/users-utilities';
import { LeaderboardList } from '../components/LeaderboardList';
import { LevelXpOverviewSection } from '../components/levelXpOverviewSection';
import { BadgesHorizontalScrollContainer } from '../components/BadgesHorizontalScrollContainer';
import { BadgeDetailsModal } from '../components/modals/BadgeDetailsModal';

export function ProfileScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const isFocused = useIsFocused();
    const { user, signOut, fetchAndSetProfileData, setLoggedInUser, userProfile } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldShowBadgeModal, setShouldShowBadgeModal] = useState(false);
    const [shouldShowAddContactModal, setShouldShowAddContactModal] = useState(false);
    const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage);
    const [leaderboardTop3, setLeaderboardTop3] = useState([]);
    const [badgeModalData, setBadgeModalData] = useState(null);
    const [trustedContacts, setTrustedContacts] = useState([]);
    const [newContactPhoneNum, setNewContactPhoneNum] = useState('');
    const [newContactName, setNewContactName] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const insets = useSafeAreaInsets();

    // function to handle showing badge modal
    const showBadgeModal = (badge) => {
        //setShouldDisableScroll(true);
        setBadgeModalData({
            ...badge
        });
        setShouldShowBadgeModal(true);
    };

    // function to handle hiding badge modal
    const hideBadgeModal = () => {
        setShouldShowBadgeModal(false);
        setBadgeModalData(null);
    };

    // close modal to add new trusted contact
    const handleClosingNewTrustedContactModal = () => {
        setShouldShowAddContactModal(false); 
        setNewContactName(''); 
        setNewContactPhoneNum('');
    }

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
            showErrorToast(t('profileScreen.failedToChangeLang'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }  
    };

    // handle signing out
    const handleSignOut = async () => {
        setIsLoading(true);

        try{
            await signOut();
        }
        catch(error){
            showErrorToast(t('authWords.failedToSignOut'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }

        setIsLoading(false);
    };

    // handle getting leaderboard
    const getLeaderboardTop3 = async (userId) => {
        try{
            // leaderboard data (ordered from highest to lowest rank)
            const leaderboardData = await getLeaderboard(userId);

            // slice the array to get only the first 3 items
            const top3Data = leaderboardData.slice(0, 3);

            if(top3Data){
                return top3Data;
            }
            else{
                throw new Error(t('shared.somethingWentWrong'));
            }
        }
        catch(error){
            showErrorToast((t('profileScreen.failedToGetTop3Leaderboard')), `${error.message ?? JSON.stringify(error)}`);
        }
    };

    const handleLeaderboardRefresh = async(userId) => {
        setIsLoading(true);

        try{
            const fetchedData = await getLeaderboardTop3(userId);
            setLeaderboardTop3(fetchedData);
        }
        catch(error){
            showErrorToast(t('profileScreen.failedToRefreshLeaderboard'), `${error.message ?? JSON.stringify(error)}`);
        }

        setIsLoading(false);
    };

    // function add a trusted contact
    const addTrustedContact = async(userId, phoneNumToAdd, contactNameToAdd) => {
        try{
            if(newContactName && newContactPhoneNum){
                const newContactObj = {
                    user_id: userId,
                    phone_num: phoneNumToAdd,
                    contact_name: contactNameToAdd
                };

                const { error } = await supabase.schema('users')
                                                .from('users_trusted_contacts')
                                                .insert(newContactObj);

                if(error){
                    if(error.code == 23505){
                        throw new Error(t('profileScreen.alreadySavedNumber'));
                    }
                    else{
                        throw error;
                    }
                }
                else{
                    // save to local storage, to be removed when signed out
                    await AsyncStorage.setItem('trustedContacts', JSON.stringify([...trustedContacts, newContactObj]));

                    // add to array state
                    setTrustedContacts([...trustedContacts, newContactObj]);

                    // close modal
                    setShouldShowAddContactModal(false);
                }
            }
            else{
                throw new Error(t('profileScreen.phoneNumAndNameCantBeEmpty'));
            }
        }
        catch(error){
             showErrorToast(t('profileScreen.failedToAddContact'),  
                              `${error.message ?? JSON.stringify(error)}`);
        };
    };

    // function to remove trusted contact
    const removeTrustedContact = async(userId, phoneNumToRemove) => {
        try{
            const { error } = await supabase.schema('users')
                                            .from('users_trusted_contacts')
                                            .delete()
                                            .eq('user_id', userId)
                                            .eq('phone_num', phoneNumToRemove);

            if(error){
                showErrorToast(t('profileScreen.failedToRemoveContact'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                // get new trusted contact array with the contact removed
                const newTrustedContactsArr = trustedContacts.filter((item) => (item.phone_num != phoneNumToRemove));

                // remove the contact from state array and async storage
                await AsyncStorage.setItem('trustedContacts', JSON.stringify(newTrustedContactsArr));

                // update the state array
                setTrustedContacts(newTrustedContactsArr);
            }
        }
        catch(error){
            showErrorToast(t('profileScreen.failedToRemoveContact'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
    };

    // function to fetch screen's data
    const fetchScreenData = async(userId) => {
        // fetch and update userProfile state 
        try{
            await fetchAndSetProfileData(user.id);
        }
        catch(error){
            setLoggedInUser(null);
        };

        const userTrustedContactData = await getTrustedContacts(userId);
        if(userTrustedContactData){
            await AsyncStorage.setItem('trustedContacts', JSON.stringify(userTrustedContactData));
            setTrustedContacts(userTrustedContactData);
        };        

        const leaderboardTop3Data = await getLeaderboardTop3(userId);
        if(leaderboardTop3Data){
            setLeaderboardTop3(leaderboardTop3Data);
        };
    };

    // handle pull to refresh (re-fetch screen data)
    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        fetchScreenData(user.id);
        
        setRefreshing(false);
    }, [user]);

    useEffect(()=>{
        if(user && isFocused == true){
            setIsLoading(true); 
    
            // fetch sreeen's data
            fetchScreenData(user.id)

            setIsLoading(false);
        }
    }, [user, isFocused]);
    
    return(
        <View style={styles.screenContainer}>
            <ScrollView style={[styles.profileScreenScrollContainer, { paddingLeft: insets.left,
                                                                       paddingRight: insets.right }]}
                        contentContainerStyle={[styles.screenScrollContainerContent, 
                                                {paddingBottom: insets.bottom + 80}]}
                        nestedScrollEnabled={true}
                        refreshControl={ <RefreshControl refreshing={refreshing} 
                                                         onRefresh={onRefresh}
                                                         colors={['#2D3782']}
                                                         progressBackgroundColor='#9ec110' />}>

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
                                @{userProfile?.username ?? 'Unknown User'}
                            </Text>

                            {/* following and followers buttons with the following/followers count */}
                            <View style={styles.followingFollowersBtnsContainer}>
                                {/* following button */}
                                <TouchableOpacity style={styles.followingFollowersBtns}
                                                  accessibilityRole='button'
                                                  onPress={()=>{
                                                    navigation.navigate('Following/Followers', 
                                                                        {
                                                                            screenTitle: t('shared.following'),
                                                                            userId: user.id
                                                                        })
                                                  }}>
                                    <Text style={styles.followingFollowersBtnsTxt}>
                                        {userProfile?.following_count} {t('shared.following')}
                                    </Text>
                                </TouchableOpacity>

                                {/* followers count */}
                                <TouchableOpacity style={styles.followingFollowersBtns}
                                                  accessibilityRole='button'
                                                  onPress={()=>{
                                                    navigation.navigate('Following/Followers', 
                                                                        {
                                                                            screenTitle: t('shared.followers'),
                                                                            userId: user.id
                                                                        })
                                                  }}>
                                    <Text style={styles.followingFollowersBtnsTxt}>
                                        {userProfile?.followers_count} {t('shared.followers')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* level/league and xp overview */}
                            <LevelXpOverviewSection levelImgUrl={userProfile?.level_img_url}
                                                    levelName={userProfile?.level_name}
                                                    xp={userProfile?.xp} />

                            <View style={styles.progressBarArea}>
                                <View style={styles.progressBar}>
                                    <View style={styles.unfilledBar}>
                                        <View style={[styles.filledBar, 
                                                    {width: `${((userProfile?.xp - userProfile?.current_level_min_xp)/
                                                                (userProfile?.next_level_min_xp - userProfile?.current_level_min_xp)) 
                                                                * 100}%`}]}>
                                        </View>
                                    </View>

                                    {/* next level name at the end of progress bar */}
                                    <View style={styles.nextLevelContainer}>
                                        <Text style={styles.nextLevelTxt}>
                                            {userProfile?.next_level_name}
                                        </Text>
                                    </View>
                                </View>

                                {/* XP ratio text: xp gained by user after reaching current level / required XP to gain to reach next level */}
                                <Text style={styles.xpRatioTxt}>
                                    {userProfile?.xp - userProfile?.current_level_min_xp}/{userProfile?.next_level_min_xp - userProfile?.current_level_min_xp} Required XP
                                </Text>
                            </View>

                            {/* badges section */}
                            <View style={styles.badgesSection}>
                                <View style={styles.badgesSectionHeader}>
                                    {/* badges section heading text */}
                                    <Text style={styles.headingTxts}>
                                        {t('profileScreen.badges')}
                                    </Text>
                                </View>

                                {/* horizontal scroll view for showing badges */}
                                <BadgesHorizontalScrollContainer badgesArr={userProfile?.user_badges}
                                                                 accessibilityRole='scrollbar' 
                                                                 handleBadgePress={showBadgeModal} />

                            </View>

                            {/* leaderboard top 3 section */}
                            <View style={styles.leaderboardSection}>
                                <View style={styles.leaderboardHeader}>
                                    <View style={styles.leaderboardHeadingAndRefreshBtn}>
                                        {/* section heading text */}
                                        <Text style={styles.headingTxts}>Leaderboard (Top 3)</Text>

                                        {/* refresh button */}
                                        <TouchableOpacity onPress={()=>{handleLeaderboardRefresh(user.id)}}
                                                          accessibilityRole='button'>
                                            <RotateCw size={22} color={'#2D3782'} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={styles.viewAllBtn}
                                                      accessibilityRole='button'
                                                      onPress={()=>{navigation.navigate('Leaderboard')}}>
                                        <Text style={styles.viewAllTxt}>
                                            {t('profileScreen.viewAll')} 
                                        </Text>
                                        <ChevronRight size={20} color={'#2D3782'} />
                                    </TouchableOpacity>
                                </View>

                                <LeaderboardList leaderboardData={leaderboardTop3}  />
                            </View>

                            <View style={styles.trustedContactSection}>
                                {/* the trusted contacts section heading text */}
                                <Text style={styles.headingTxts}>
                                    {t('profileScreen.trustedContacts')}
                                </Text>

                                <View style={styles.trustedContactList}>
                                    {
                                        (trustedContacts.map((item, index) => {
                                            return(
                                                <View key={index} style={[styles.trustedContactItem, 
                                                                          index !== trustedContacts.length - 1 && {borderBottomWidth: 2}]}>
                                                    
                                                    <View style={styles.trustedContactItemTxts}>
                                                        {/* contact name */}
                                                        <Text style={styles.trustedContactNameTxt}>
                                                            {item.contact_name}
                                                        </Text>

                                                        {/* contact number */}
                                                        <Text style={styles.trustedContactNumTxt}>
                                                            {item.phone_num} 
                                                        </Text>
                                                    </View>
                                        
                                                    {/* remove button */}
                                                    <TouchableOpacity style={styles.trustedContactRemoveBtn}
                                                                      accessibilityRole='button'
                                                                      onPress={()=>{removeTrustedContact(user.id, item.phone_num)}}>
                                                        <Text style={styles.trustedContactRemoveBtnTxt}>
                                                            {t('shared.remove')}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }))
                                    }

                                    {/* button to add trusted contact */}
                                    <TouchableOpacity style={styles.trustedContactListAddBtn} 
                                                      accessibilityRole='button'
                                                      onPress={()=>{setShouldShowAddContactModal(true)}}>
                                        <Text style={styles.trustedContactListAddBtnTxt}>
                                            {t('shared.add')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) :
                    (
                        // text shown when fetching user profile data failed
                        <Text style={styles.failedToFetchUserDataText}>
                            {t('profileScreen.failedToFetchUserData')}
                        </Text>
                    )
                }

                {/* buttons at the bottom of the screen */}
                    <View style={styles.bottomButtonsContainer}>
                        {/* button for changing language
                            if current language is English, show button to change language to Indonesian,
                            if current language is Indonesian, show button to change language to English */}
                        {
                            currentLang == 'en' ? 
                            (
                                <TouchableOpacity onPress={()=>{handleLangChange('id')}}
                                                  accessibilityRole='button'
                                                  style={[styles.bottomButtonsBase, styles.changeLangButtonColor]}>
                                    <Text style={[styles.bottomButtonTextBase, styles.changeLangButtonTxtColor]}>
                                        {t('profileScreen.changeLangToId')}
                                    </Text>
                                </TouchableOpacity>
                                
                            ):
                            currentLang == 'id' &&
                            (
                                <TouchableOpacity onPress={()=>{handleLangChange('en')}}
                                                  accessibilityRole='button'
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
                        <TouchableOpacity onPress={()=>{handleSignOut()}}
                                          style={[styles.bottomButtonsBase, styles.signOutBtnColor]}
                                          accessibilityRole='button'>
                            <Text style={[styles.bottomButtonTextBase, styles.signOutBtnTxtColor]}>
                                {t('profileScreen.signOutBtnTxt')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* loading indicator to show when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }

            {/* badge modal shown when shouldShowBadgeModal is true */}
            {
                shouldShowBadgeModal == true && (
                    <BadgeDetailsModal badgeModalData={badgeModalData} 
                                       hideBadgeModalFunc={hideBadgeModal}/>
                )
            }

            {/* modal for adding a new trusted contact, 
                shown when shouldShowAddContactModal is true */}
            {
                shouldShowAddContactModal == true && (
                    <BottomModalBase title={t('profileScreen.addNewTrustedContact')} 
                                     closeFunc={()=>{handleClosingNewTrustedContactModal()}}>
                                    
                        
                        <View style={styles.addContactModalContentContainer}>
                            {/* phone number input area */}
                            <View style={styles.addContactModaTextInputContainer}>
                                {/* input label */}
                                <Text style={styles.addContactModalTextInputLabelTxt}>
                                    {t('profileScreen.phoneNumber')}
                                </Text>

                                {/* text input */}
                                <TextInput style={styles.addContactModalTextInput}
                                           keyboardType='numeric'
                                           onChangeText={setNewContactPhoneNum}/>
                            </View>

                            {/* contact name input area */}
                            <View style={styles.addContactModaTextInputContainer}>
                                {/* input label */}
                                <Text style={styles.addContactModalTextInputLabelTxt}>
                                    {t('profileScreen.contactName')}
                                </Text>

                                {/* text input */}
                                <TextInput style={styles.addContactModalTextInput} 
                                           onChangeText={setNewContactName} />
                            </View>

                            {/* button to add contact */}
                            <TouchableOpacity style={styles.addContactModalAddBtn}
                                              accessibilityRole='button'
                                              onPress={async()=>{await addTrustedContact(user.id, 
                                                                                         newContactPhoneNum, 
                                                                                         newContactName)}}>
                                <Text style={styles.addContactModalAddBtnTxt}>
                                    {t('shared.add')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </BottomModalBase>
                )
            }

         {
            isLoading == true && (
                <LoadingOverlay />
            )
        }
        </View>
    )
};

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        height: '100%', 
        width: '100%'
    },
    // screen scroll view container
    profileScreenScrollContainer: {
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
        rowGap: 30,
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
    // heading texts of the sections on the screen
    headingTxts: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3782'
    },
    // the progress bar section with progress bar and xp ratio text
    progressBarArea: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginTop: 20
    },
    // the progress bar
    progressBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20
    },
    // unfilled bar in the progress bar
    unfilledBar: {
        backgroundColor: 'lightgrey',
        width: '100%',
        height: 12,
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        elevation: 2
    },
    // filled part of the progress bar
    filledBar: {
        backgroundColor: '#2D3782',
        height: '100%',
        borderRadius: 12
    },
    // container of next level name at the end of the progress bar
    nextLevelContainer: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2D3782',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        right: 0,
        padding: 10
    },
    // the text showing the next level name at the end of progress
    nextLevelTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
        width: '100%',
        textAlign: 'center'
    },
    // the XP ratio text under the progress bar
    xpRatioTxt: {
        color: '#2D3782',
        fontSize: 15
    },
    // container of the leaderboard section
    leaderboardSection: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    },
    /* header of leaderboard section 
       with heading text and refresh button */
    leaderboardHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    /* container of leaderboard heading 
       text and refresh button */
    leaderboardHeadingAndRefreshBtn: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 7,
        alignItems:'center'
    },
    // view all text in leaderboard section
    viewAllTxt: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3782'
    },
    /* view all button in leaderboard section 
       with view all text and chevron icon */
    viewAllBtn: {
        display: 'flex',
        flexDirection: 'row'
    },
    // the trusted contact section container
    trustedContactSection: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%'
    },
    // container of list of trusted contacts
    trustedContactList: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 20,
        width: '100%',
        padding: 30,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white',
        minHeight: 100,
        marginTop: 15
    },
    // add button at the bottom of trusted contact list
    trustedContactListAddBtn: {
        backgroundColor: '#2D3782',
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50
    },
    /* text inside the add button at 
       the bottom of trusted contact list */
    trustedContactListAddBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // content container for modal for adding new trusted contact
    addContactModalContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20
    },
    // text inputs on modal for adding new trusted contact
    addContactModalTextInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#2D3782',
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 20,
        color: 'black',
        backgroundColor: 'white'
    },
    // labels for text inputs on add contact modal
    addContactModalTextInputLabelTxt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600'
    },
    // add button on modal for adding new trusted contact
    addContactModalAddBtn: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3782',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 50
    },
    // text inside add button on modal for adding new trusted contact
    addContactModalAddBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // container of tex input and its label on add contact modal
    addContactModaTextInputContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    // container of each item in the trusted contacts list
    trustedContactItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15
    },
    // container of texts in each trusted contact item
    trustedContactItemTxts: {
        display: 'flex',
        flexDirection: 'column',
        borderBottomColor: '#2D3782',
        rowGap: 5
    },
    // contact name text in the trusted contacts list
    trustedContactNameTxt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600'
    },
    // contact number text in the trusted contacts list
    trustedContactNumTxt: {
        color: '#2D3782',
        fontSize: 15
    },
    // button to remove trusted contact
    trustedContactRemoveBtn: {
        backgroundColor: '#9ec110',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        maxWidth: 200
    },
    // text inside the button to remove trusted contact
    trustedContactRemoveBtnTxt: {
        color: '#2D3782',
        fontSize: 15,
        fontWeight: '600' 
    }
});
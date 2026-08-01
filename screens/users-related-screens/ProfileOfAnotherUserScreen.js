import { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { getUserProfileData } from '../../utils/users-utilities';
import { AuthContext } from '../../contexts/AuthContext';
import { showErrorToast } from '../../utils/show-toast';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { UserProfilePicture } from '../../components/UserProfilePicture';
import { supabase } from '../../lib/supabase';
import { ScrollView } from 'react-native-gesture-handler';
import { LevelXpOverviewSection } from '../../components/levelXpOverviewSection';
import { BadgesHorizontalScrollContainer } from '../../components/BadgesHorizontalScrollContainer';
import { BadgeDetailsModal } from '../../components/modals/BadgeDetailsModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addFollow, removeFollow } from '../../utils/users-utilities';

export function ProfileOfAnotherUserScreen({navigation, route}) {
    const [ userData, setUserData ] = useState({});
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ authUserIsFollowing, setAuthUserIsFollowing ] = useState(false);
    const [ shouldShowBadgeModal, setShouldShowBadgeModal ] = useState(false);
    const [ badgeModalData, setBadgeModalData ] = useState(null);
    const insets = useSafeAreaInsets();

    const handleFollowUnfollowButtonPress = async (authUserId, viewedUserId) => {
        setIsLoading(true);

        if(authUserIsFollowing == false){
            try{
                await addFollow(authUserId, viewedUserId);
                setAuthUserIsFollowing(true);
                const newFollowerCount = userData.followers_count + 1;
                setUserData({...userData, followers_count: newFollowerCount});
            }
            catch(error){
                if(error.code == 23514){
                    showErrorToast(t('shared.failedToFollow'), t('shared.cantFollowSelf'));
                }
                else if(error.code == 23505){
                    showInfoToast(t('shared.alreadyFollowed'), '');
                }
                else{
                    showErrorToast(t('shared.failedToFollow'), `${error.message ?? JSON.stringify(error)}`);
                }
            }
        }
        else if(authUserIsFollowing == true){
            try{
                await removeFollow(authUserId, viewedUserId);
                setAuthUserIsFollowing(false);
                const newFollowerCount = userData.followers_count - 1;
                setUserData({...userData, followers_count: newFollowerCount});
            }
            catch(error){
                showErrorToast(t('shared.failedToUnfollow'), `${error.message ?? JSON.stringify(error)}`);
            }
        }

        setIsLoading(false);
    }

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

    useEffect(()=>{
        // function to fetch required profile data of the user in route parameter
        const getProfileData = async() => {
            try{
                const fetchedData = await getUserProfileData(route.params.userId);

                if(fetchedData){
                    setUserData(fetchedData);
                }
                else{
                    throw new Error(t('profileOfAnotherUserScree.userDataNotFound'));
                }
            }
            catch(error){
                showErrorToast(t('profileOfAnotherUserScreen.failedToFetchUserData'), 
                               `${error.message ?? JSON.stringify(error)}`);
            };
        };

        // function to check if authenticated user is following the viewed user
        const checkIfAuthUserIsFollowing = async(authUserId, viewedUserId) => {
            try{
                const { data, error } = await supabase.schema('users')
                                                      .from('user_1_is_following_user_2')
                                                      .select()
                                                      .eq('user1', authUserId)
                                                      .eq('user2', viewedUserId);

                if(error){
                    throw error;
                }
                else{
                    if(data){
                        // if it returns empty, it means user is not following the viewed user
                        if (data.length == 0){
                           setAuthUserIsFollowing(false);
                        }
                        // otherwise, it means they are following the viewed user
                        else{
                            setAuthUserIsFollowing(true);
                        }
                    }
                    else{
                        throw new Error(t('profileOfAnotherUserScreen.dataForFollowStatusNotFound'));
                    }
                }
            }
            catch(error){
                showErrorToast(t('profileOfAnotherUserScreen.failedToFetchFollowStaus'),
                               `${error.message ?? JSON.stringify(error)}`);
            }
        };

        // if user is viewing their own profile, redirect to the Profile screen
        if(route.params.userId == user.id){
            navigation.popTo('Profile');
        }
        // otherwise fetch relevant data and update corresponding states
        else{
            setIsLoading(true);

            // get profile data of viewed user
            getProfileData();

            // check if authenticated user is following the viewed user
            checkIfAuthUserIsFollowing(user.id, route.params.userId);
            
            setIsLoading(false);
        }
    }, []);

    return(
        <View style={[styles.screenContainer, { paddingLeft: insets.left,
                                                paddingRight: insets.right }]}>
            <ScrollView style={[styles.screenScrollContainer, { paddingBottom: insets.bottom + 70 }]}
                        contentContainerStyle={styles.screenScrollContentContainer}>

                <View style={styles.contentWrapper}>
                    {/* profile picture */}
                    <UserProfilePicture imgUrl={userData?.avatar_img_url} 
                                        width={200} 
                                        height={200} 
                                        bgColor='#D2DAE4' />

                    {/* username */}
                    <Text style={styles.usernameTxt}>
                        @{userData?.username}
                    </Text>

                    {/* following and followers buttons */}
                    <View style={styles.followingFollowersBtnsContainer}>
                        {/* following button */}
                        <TouchableOpacity style={styles.followingFollowersBtns}
                                          onPress={()=>{
                                            navigation.navigate('Following/Followers', 
                                                                {
                                                                    screenTitle: t('shared.following'),
                                                                    userId: route.params.userId
                                                                })
                                          }}>
                            <Text style={styles.followingFollowersBtnsTxt}>
                                {userData?.following_count} {t('shared.following')}
                            </Text>
                        </TouchableOpacity>

                        {/* followers button */}
                        <TouchableOpacity style={styles.followingFollowersBtns}
                                          onPress={()=>{
                                          navigation.navigate('Following/Followers', 
                                                              {
                                                                screenTitle: t('shared.followers'),
                                                                userId: route.params.userId
                                                              })
                                          }}>
                            <Text style={styles.followingFollowersBtnsTxt}>
                                {userData?.followers_count} {t('shared.followers')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* follow/unfollow button, depending on if authenticated user is 
                        already following the viewed user */}
                    <TouchableOpacity style={styles.followBtn}
                                      onPress={()=>{handleFollowUnfollowButtonPress(user.id, route.params.userId)}}>
                        <Text style={styles.followBtnTxt}>
                            {authUserIsFollowing == true ? t('shared.unfollow') : t('shared.follow')}
                        </Text>
                    </TouchableOpacity>

                    {/* section showing the viewed user's level and total XP */}
                    <LevelXpOverviewSection levelImgUrl={userData?.level_img_url} 
                                            levelName={userData?.level_name} 
                                            xp={userData?.xp} />

                   {/* horizontal scroll view showing the viewed user's badges */}
                   <BadgesHorizontalScrollContainer badgesArr={userData?.user_badges} 
                                                    handleBadgePress={showBadgeModal} />
                </View>
            </ScrollView>

            {/* loading overlay shown when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }

            {/* badge details modal shown when shouldShowBadgeModal is true */}
            {
                shouldShowBadgeModal == true && (
                    <BadgeDetailsModal badgeModalData={badgeModalData} 
                                       hideBadgeModalFunc={hideBadgeModal}/>
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
    // container of scroll view containing screen's content
    screenScrollContainer: {
       width: '100%',
       backgroundColor: 'white'
    },
    // content container inside screen scroll view 
    screenScrollContentContainer: {
        padding: 30,
        display: 'flex',
        alignItems: 'center',
        rowGap: 20
    },
    // content wrapper inside the scroll view
    contentWrapper: {
        display: 'flex', 
        alignItems: 'center',
        flexDirection: 'column',
        maxWidth: 550,
        width: '100%',
        rowGap: 20
    },
    // username text
    usernameTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3782'
    },
    // containaer of following and followers buttons
    followingFollowersBtnsContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
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
    // follow/unfollow button
    followBtn: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3782',
        borderRadius: 50,
        padding: 10
    },
    // follow/unfollow button txt
    followBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    }
});
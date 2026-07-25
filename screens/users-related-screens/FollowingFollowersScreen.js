import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { getFollowers, getFollowing } from '../../utils/users-utilities';
import { showErrorToast } from '../../utils/show-toast';
import { UserProfilePicture } from '../../components/UserProfilePicture';

export function FollowingFollowersScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [followData, setFollowData] = useState([]);

    useEffect(()=>{
        const fetchFollowingOrFollowers = async (userId) => {
            try{
                if(route.params.screenTitle == t('profileScreen.following')){
                    const fetchedFollowingData = await getFollowing(userId);
                    //console.log(fetchedFollowingData.map(follower => follower.profiles_public_data));
                    setFollowData(fetchedFollowingData.map(follower => follower.profiles_public_data));

                }
                else if(route.params.screenTitle == t('profileScreen.followers')){
                    const fetchedFollowersData = await getFollowers(userId);
                    //console.log(fetchedFollowersData.map(follower => follower.profiles_public_data));
                    setFollowData(fetchedFollowersData.map(follower => follower.profiles_public_data));
                }
            }
            catch(error){
                showErrorToast(t('followingFollowersScreen.failedToFetch', 
                                 {followingOrFollowers: route.params.screenTitle}),
                               `${error.message ?? error}`);
            }
        };

        if(route.params.userId && route.params.screenTitle){
            fetchFollowingOrFollowers(route.params.userId)
        }
    }, [route.params])

    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.listScrollView}
                        contentContainerStyle={styles.listScrollViewContentContainer}>
               {
                followData.map((user, i) => (
                    <View key={i} style={styles.followDataItemContainer}>
                        <UserProfilePicture width={100} 
                                            height={100} 
                                            bgColor='#D2DAE4' 
                                            imgUrl={user.avatar_img_url} />
                        <Text style={styles.usernameTxt}>
                            @{user.username}
                        </Text>
                    </View>
                ))
               }
            </ScrollView>

            {/* container of the button to find other users, 'sticky' at the bottom of screen */}
            <View style={[styles.findUsersBtnContainer, {paddingBottom: insets.bottom}]}>
                {/* button to find other users */}
                <TouchableOpacity style={styles.findUsersBtn}
                                  accessibilityRole='button'
                                  accessibilityLabel={'followingFollowersScreen.findUserBtnAccLbl'}
                                  onPress={()=>{navigation.navigate('Find Users')}}>
                    <Text style={styles.findUsersBtnTxt}
                          accessibilityHint='link'>
                        {t('followingFollowersScreen.findUsersToFollowBtnTxt')}
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
    },
    // container of each follow data item
    followDataItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 30,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3782' 
    },
    // text showing username of user in follow data
    usernameTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    }
});
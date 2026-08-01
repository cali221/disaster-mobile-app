import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useContext } from 'react';
import { showErrorToast } from '../../utils/show-toast';
import { supabase } from '../../lib/supabase';
import { UsersList } from '../../components/UsersList';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function FollowingFollowersScreen({ navigation, route }) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [followData, setFollowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // function to get following and followers data of user
    const getUserFollowData = async(userId) => {
        const { data, error } = await supabase.schema('public')
                                              .rpc('get_user_follow_data', {user_id_input: userId});

        if(error){
            throw error;
        }
        else{
            return data;
        }
    };

    useEffect(()=>{
        // fetch following/followers data
        const fetchFollowingOrFollowers = async (userId) => {
            setIsLoading(true);
            try{
                const fetchedFollowData = await getUserFollowData(userId);

                /* if viewing following screen, filter to only show 
                   users the authenticated user is following */
                if(route.params.screenTitle == t('profileScreen.following')){
                    setFollowData(fetchedFollowData.filter((item) => item.user_is_following == true));
                }
                /* if viewing followers screen, filter to only show 
                   users following the authenticated users */
                else if(route.params.screenTitle == t('profileScreen.followers')){
                    setFollowData(fetchedFollowData.filter((item) => item.is_following_user == true));
                }
            }
            catch(error){
                console.error(error)
                showErrorToast(t('followingFollowersScreen.failedToFetch', 
                                 {followingOrFollowers: route.params.screenTitle}),
                               `${error.message ?? JSON.stringify(error)}`);
            }
            setIsLoading(false);
        };

        if(route.params.userId && route.params.screenTitle){
            fetchFollowingOrFollowers(route.params.userId)
        }
    }, [route.params])

    return(
        <View style={styles.screenContainer}>
            <UsersList data={followData} 
                       setData={setFollowData}
                       setIsLoading={setIsLoading} />

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

            {/* loading ovelay, shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
};

const styles = StyleSheet.create({
    // the screen container
    screenContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        alignContent: 'space-between',
        paddingHorizontal: 30
    },
    /* container of the find users to follow button 
       at bottom of screen ('sticky') */
    findUsersBtnContainer: {
        backgroundColor: 'white',
        height: 180,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
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
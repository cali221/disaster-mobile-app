import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserProfilePicture } from './UserProfilePicture';
import { addFollow, removeFollow } from '../utils/users-utilities';
import { showErrorToast, showInfoToast } from '../utils/show-toast';
import { useNavigation } from '@react-navigation/native';

export function UsersList(props) {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);

    // function handling action button press on UsersList
    const handleActionButtonPress = async(userId, item, dataState, setDataState) => {
        // show loading overlay on parent
        props.setIsLoading(true);

        // if user is already follwowing the user, unfollow
        if(item.auth_user_is_following == false){
            // insert follow data to DB
            try{
                await addFollow(userId, item.user_id);

                // update state
                const indexToEdit = dataState.findIndex(u => u.user_id === item.user_id);
                if(indexToEdit !== -1){
                    const newSearchResArr = [...dataState];
                    newSearchResArr[indexToEdit] = {...newSearchResArr[indexToEdit], auth_user_is_following: true};
                    setDataState(newSearchResArr);
                }
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
        // if user hasn't followed the user, follow
        else if(item.auth_user_is_following == true){
            try{
                // remove follow data from DB
                await removeFollow(userId, item.user_id);

                // update state
                const indexToEdit = dataState.findIndex(u => u.user_id === item.user_id);
                
                if(indexToEdit !== -1){
                    const newSearchResArr = [...dataState];
                    newSearchResArr[indexToEdit] = {...newSearchResArr[indexToEdit], auth_user_is_following: false};
                    setDataState(newSearchResArr);
                }
            }
            catch(error){
                showErrorToast(t('shared.failedToUnfollow'), `${error.message ?? JSON.stringify(error)}`);
            }
        }

        // hide loading overlay on parent
        props?.setIsLoading(false);
    };
        
    return(
        <ScrollView style={styles.listScrollView}
                    contentContainerStyle={[styles.listScrollViewContentContainer, 
                                           {padding: props?.listPaddingVal ?? 0}]}>
            {props?.data && 
                (props?.data.map((item, i) => (
                    /* container of each following/follower data item 
                       containing username and profile picture */ 
                    <View key={i} style={styles.dataItemContainer}>
                        <View style={styles.txtsAndPfpContainer}>
                            <TouchableOpacity accessibilityRole='button'
                                              onPress={()=>{navigation.navigate('Profile of Another User', 
                                                                                {
                                                                                    screenTitle: `@${item.username}`,
                                                                                    userId: item.user_id
                                                                                }
                                                                               )}}>
                                <UserProfilePicture width={70} 
                                                    height={70} 
                                                    bgColor='#D2DAE4' 
                                                    imgUrl={item.avatar_img_url} />
                            </TouchableOpacity>

                            <View style={styles.dataItemTxts}>
                                {/* username */}
                                <Text style={styles.usernameTxt} 
                                      accessibilityRole='link'
                                      onPress={()=>{navigation.navigate('Profile of Another User', 
                                                                        {
                                                                            screenTitle: `@${item.username}`,
                                                                            userId: item.user_id
                                                                        }
                                                                        )}}>
                                    @{item.username} {item.user_id == user.id && `(${t('shared.you')})`}
                                </Text>

                                {/* 'Follows You' text */}
                                { item.is_following_auth_user == true && (
                                    <Text style={styles.followsYouTxt}>
                                        {t('shared.followsYou')}
                                    </Text>
                                )
                                }
                            </View>
                        </View>

                        {/* action button for following/unfollowing */}
                        {
                            item.user_id !== user.id && (
                                <TouchableOpacity accessibilityRole='button'
                                                  onPress={()=>{handleActionButtonPress(user.id, 
                                                                                        item, 
                                                                                        props.data, 
                                                                                        props.setData)}}
                                          style={styles.actionBtn}>
                                    <Text style={styles.actionBtnTxt}>
                                        {
                                            (item.auth_user_is_following == true) ? 
                                            t('shared.unfollow')
                                            :
                                            (item.is_following_auth_user == true) ? 
                                            t('shared.followBack')
                                            :
                                            t('shared.follow')
                                            
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                ))
            )}
        </ScrollView>
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
        width: '100%'
    },
    // container of each follow data item
    dataItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3782',
        rowGap: 20 
    },
    // text showing username of user in follow data
    usernameTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3782',
        width: '100%',
        maxWidth: 100
    },
    // container of data item texts and PFP
    txtsAndPfpContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 10,
        flex: 1
    },
    // container of data item texts (username and 'Follows You' text)
    dataItemTxts:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    // 'Follows You' text, shown conditionally
    followsYouTxt: {
        fontSize: 16,
        color: '#2D3782'
    },
    // action button for each data item 
    actionBtn: {
        backgroundColor: '#2D3782',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        paddingVertical: 7,
        paddingHorizontal: 10,
        width: 120
    },
    // text inside action button
    actionBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center'
    }
});
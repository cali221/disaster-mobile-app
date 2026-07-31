import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserProfilePicture } from './UserProfilePicture';

export function UsersList(props) {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    
    return(
        <ScrollView style={styles.listScrollView}
                    contentContainerStyle={styles.listScrollViewContentContainer}>
            {props.data && 
                (props.data.map((item, i) => (
                    /* container of each following/follower data item 
                       containing username and profile picture */ 
                    <View key={i} style={styles.dataItemContainer}>
                        <View style={styles.txtsAndPfpContainer}>
                            <UserProfilePicture width={80} 
                                                height={80} 
                                                bgColor='#D2DAE4' 
                                                imgUrl={item.avatar_img_url} />

                            <View style={styles.dataItemTxts}>
                                <Text style={styles.usernameTxt}>
                                    @{item.username}
                                </Text>

                                <Text style={styles.followsYouTxt}>
                                    {
                                        item.is_following_user == true && t('shared.followsYou')
                                    }
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={()=>{props.handleActionButtonPress(user.id, item)}}
                                          style={styles.actionBtn}>
                            <Text style={styles.actionBtnTxt}>
                                {
                                    (item.user_is_following == true) ? 
                                    t('shared.unfollow')
                                    :
                                    (item.is_following_user == true) ? 
                                    t('shared.followBack')
                                    :
                                    t('shared.follow')
                                    
                                }
                            </Text>
                        </TouchableOpacity>
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
        width: '100%',
        padding: 30
    },
    // container of each follow data item
    dataItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3782' 
    },
    // text showing username of user in follow data
    usernameTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // container of data item texts and PFP
    txtsAndPfpContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 10
    },
    // container of data item texts (username and 'Follows You' text)
    dataItemTxts:{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    // 'Follows You' text, shown conditionally
    followsYouTxt: {
        color: '#2D3782'
    },
    // action button for each data item 
    actionBtn: {
        backgroundColor: '#2D3782',
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 130,
        borderRadius: 100
    },
    // text inside action button
    actionBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center'
    }
});
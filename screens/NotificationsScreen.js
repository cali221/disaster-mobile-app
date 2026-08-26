import { RefreshControl, 
         Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView } from 'react-native';
import { useContext, useEffect, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { RotateCw } from 'lucide-react-native';
import { showErrorToast, showSuccessToast, showInfoToast } from '../utils/show-toast';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { addFollow } from '../utils/users-utilities';

// TODO: implement the notification for Mutuals tab

// function to fetch notifications for logged in user
// placed outside useEffect so it can be used in onRefresh too
const fetchNotifications = async (userId, notifTypeToFetch) => {
    const {data, error} = await supabase.schema('users')
                                        .from('notifications')
                                        .select()
                                        .eq('dest_user_id', userId)
                                        .eq('notif_type', notifTypeToFetch)
                                        .order('created_at', { ascending: false })

    if(error){
        throw error;
    }
    else{
        if(data){
            return data;
        }
    }
};

export function NotificationsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    const [notifCategoryChosen, setNotifCategoryChosen] = useState('disasters');
    const [notificationsToShow, setNotificationsToShow] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // function to handle following back from a notification item button
    const handleFollow = async (user1, user2, notifItem) => {
        setIsLoading(true);

        try{
            // add following data to supabase
            await addFollow(user1, user2);

            // find the index of the notification where the follow took place using the id
            const index = notificationsToShow.findIndex(notif => notif.id === notifItem.id);

            // if index is found, update states
            if(index !== -1){
                const newNotifsToShowArr = [...notificationsToShow];
                newNotifsToShowArr[index] = {...notificationsToShow[index], users_are_now_mutuals: true};
                setNotificationsToShow(newNotifsToShowArr);
            }

            showSuccessToast(t('shared.followed'), '')
        }
        catch(error){
            if(error.code == 23505){
                showInfoToast(t('shared.alreadyFollowed'), '')
            }
            else{
                showErrorToast(t('shared.failedToFollow'), `${error.message ?? JSON.stringify(error)}`)
            }
        }
           
        setIsLoading(false);
    }    

    // function for handling fetching notifications
    const handleFetchNotifications = () => {
        if(user){
            try{
                if(notifCategoryChosen == 'disasters'){
                    fetchNotifications(user.id, 'disaster_notification').then((data)=>{
                        if(data){
                            setNotificationsToShow([...data]);
                        }
                    });
                }
                else if(notifCategoryChosen == 'followers'){
                    fetchNotifications(user.id, 'follow_notification').then((data)=>{
                        if(data){
                            setNotificationsToShow([...data])
                        }
                    });
                }
            }
            catch(error){
                showErrorToast(t('notifScreen.failedToFetchNotifs'), `${error.message ?? JSON.stringify(error)}`);
            }
        }
    }

    // fetch notificaiton when pulled to refresh 
    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        handleFetchNotifications();
        
        setRefreshing(false);
    }, [user?.id, notifCategoryChosen]);

    // fetch notification on first load and user/notification category change
    useEffect(()=>{
        handleFetchNotifications();
    }, [user?.id, notifCategoryChosen]);

    return(
        <View style={[styles.notificationScreenContainer, { paddingLeft: insets.left,
                                                            paddingRight: insets.right }]}>
            {/* header containing buttons to switch between notification types to show */}
            <ScrollView contentContainerStyle={styles.notificationScreenHeader} 
                        style={styles.notificationScreenHeaderScrollContainer}
                        horizontal={true}>
                {/* button to show disasters related notification */}
                <TouchableOpacity style={[styles.notifCategoryBtn, 
                                          notifCategoryChosen == 'disasters' ? 
                                                                 styles.pickedNotifCategoryBtnColor :
                                                                 styles.notPickedNotifCategoryBtnColor]}
                                  onPress={()=>{setNotifCategoryChosen('disasters')}}>
                    <Text style={[styles.notifCategoryBtnTxt, 
                                  notifCategoryChosen == 'disasters' ? 
                                                         styles.pickedNotifCategoryBtnTxtColor : 
                                                         styles.notPickedNotifCategoryBtnTxtColor]}>
                        {t('notifScreen.disastersCategoryBtn')}
                    </Text>
                </TouchableOpacity>

                {/* button to show followers related notification */}
                <TouchableOpacity style={[styles.notifCategoryBtn,
                                          notifCategoryChosen == 'followers' ?
                                          styles.pickedNotifCategoryBtnColor :
                                          styles.notPickedNotifCategoryBtnColor]}
                                  onPress={()=>{setNotifCategoryChosen('followers')}}>
                    <Text style={[styles.notifCategoryBtnTxt, 
                                  notifCategoryChosen == 'followers' ? 
                                                         styles.pickedNotifCategoryBtnTxtColor : 
                                                         styles.notPickedNotifCategoryBtnTxtColor]}>
                        {t('notifScreen.newFollowersCategoryBtn')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.notifCategoryBtn,
                                          notifCategoryChosen == 'mutuals' ?
                                          styles.pickedNotifCategoryBtnColor :
                                          styles.notPickedNotifCategoryBtnColor]}>
                    <Text style={[styles.notifCategoryBtnTxt, 
                                  notifCategoryChosen == 'mutuals' ? 
                                  styles.pickedNotifCategoryBtnTxtColor : 
                                  styles.notPickedNotifCategoryBtnTxtColor]}>
                        Mutuals
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* scroll view showing the list of notifications */}
            <ScrollView style={styles.notificationScrollContainer}
                        contentContainerStyle={styles.notificationScrollContentContainer}
                        refreshControl={ <RefreshControl refreshing={refreshing} 
                                                         onRefresh={onRefresh}
                                                         colors={['#2D3782']}
                                                         progressBackgroundColor='#9ec110' /> }>
                <View style={styles.pullToRefreshTextContainer}
                      accessibilityLabel={t('notifScreen.pullDownToRefresh')}
                      accessibilityHint={t('notifScreen.pullDownToRefreshAccHint')}>
                    {/* rotating arrow icon */}
                    <RotateCw color={'#2D3782'} />

                    {/* pull down to refresh text */}
                    <Text style={styles.pullToRefreshTxt}>
                        {t('notifScreen.pullDownToRefresh')}
                    </Text>
                </View>
                
                {/* list of notifications */}
                {
                (notificationsToShow?.map((item, index) => (
                    // container of each notification
                    <View key={index} style={styles.notificationItemContainer}>
                        <View style={styles.notificationItemTxtContainer}>
                            {/* the notification's text */}
                            <Text style={styles.notificationItemTxt}>
                                {item.body}
                            </Text>

                            <Text style={styles.notificationItemTxt}>
                                {t('notifScreen.notifCreatedAt')}: {"\n"}
                                {new Date(item.created_at).toLocaleString('id', {timeZoneName: 'short'})}
                            </Text>
                        </View>

                        {/*
                            show button according to condition:
                            - if user is viewing disasters notification, show 'Details' button on the notification item
                            - if user is viewing followers notification and the users are not yet mutuals, show 'Follow Back' button
                            - otherwise, show 'You are now mutuals text instead of a button
                        */}
                        { 
                            // if category is disasters, show details button
                            notifCategoryChosen == 'disasters' ? 
                            (
                                <TouchableOpacity style={styles.notificationItemBtn}
                                                    accessibilityRole='button'
                                                    accessibilityLabel={t('notifScreen.detailsBtnAccLbl')}
                                                    onPress={()=>{navigation.navigate('Disaster Details', 
                                                                                      {disasterId: item?.associated_disaster_id})}}> 
                                    <Text style={styles.notificationItemBtnTxt}>
                                        {t('shared.details')}
                                    </Text>
                                </TouchableOpacity>
                            ) : 
                            // if category is followers and users are not yet mutuals, show follow back button
                            (notifCategoryChosen == 'followers' && item.users_are_now_mutuals == false) &&
                            (
                                <TouchableOpacity style={styles.notificationItemBtn}
                                                  accessibilityRole='button'
                                                  accessibilityLabel={t('shared.followBack')}
                                                  onPress={()=>{handleFollow(user.id, item.mentioned_user_user_id, item)}}> 
                                    <Text style={styles.notificationItemBtnTxt}>
                                        {t('shared.followBack')}
                                    </Text>
                                </TouchableOpacity>
                            ) 
                        }
                    </View>
                )))
               }
            </ScrollView>

            {/* loading indicator shown when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    // container of the whole screen
    notificationScreenContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    /* horizontal scroll view for header containing buttons
       for switching between notification types */
    notificationScreenHeaderScrollContainer: {
        height: 120,
        flexGrow: 0
    },
    /* header containing buttons for switching 
       between notification type */
    notificationScreenHeader: {
        paddingHorizontal: 30,
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 30
    },
    // buttons for picking notification category/type
    notifCategoryBtn: {
        paddingHorizontal: 20,
        minWidth: 180,
        maxWidth: 270,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    // color of button for the picked notification category
    pickedNotifCategoryBtnColor: {
        backgroundColor: '#2D3782'
    },
    /* color of button for the notification 
       categories that are not picked */
    notPickedNotifCategoryBtnColor: {
        backgroundColor: '#D2DAE4'
    },
    /* text inside the buttons for switching
       notification type to show  */
    notifCategoryBtnTxt: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center'
    },
    /* color of text inside the picked 
       notification category button */
    pickedNotifCategoryBtnTxtColor: {
        color: '#FFFFFF'
    },
    /* color of text inside the category 
       buttons that are not picked */
    notPickedNotifCategoryBtnTxtColor: {
        color: '#2D3782'
    },
    // scroll view showing list of notifications 
    notificationScrollContainer: {
        flex: 1,
        backgroundColor: 'white'
    },
    // content container of scroll view showing list of notifications 
    notificationScrollContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 30,
        paddingBottom: 100,
        paddingHorizontal: 30,
        rowGap: 20
    },
    // container of each item in the list of notifications
    notificationItemContainer: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: 'lightgrey',
        elevation: 2,
        borderRadius: 30,
        backgroundColor: 'white',
        padding: 30,
        rowGap: 30
    },
    // container of notification item texts
     notificationItemTxtContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20
    },
    // the notification body text
    notificationItemTxt: {
        width: '100%',
        fontSize: 16,
        color: '#2D3782'
    },
    // button for doing action with the notification 
    notificationItemBtn: {
        backgroundColor: '#2D3782',
        width: '50%',
        maxWidth: 270,
        height: 45,
        borderRadius: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // text inside the button for doing action with the notification  
    notificationItemBtnTxt: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14
    },
    // container of text and icon for 'Pull Down to Refresh' information 
    pullToRefreshTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10
    },
    // the 'Pull Down to Refresh' text
    pullToRefreshTxt: {
       fontSize: 15,
       fontWeight: '600',
       color: '#2D3782'
    },
    /* 'You are now mutuals' text shown on notification 
       item where user is followed back or followed back the
       user that followed them */
    nowMutualsTxt: {
        color: '#2D3782',
        fontWeight: '600',
        fontSize: 14
    }
});
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
import { showErrorToast } from '../utils/showToast';
import { useTranslation } from 'react-i18next';
import { RotateCw } from 'lucide-react-native';

export function NotificationsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    const [notifCategoryChosen, setNotifCategoryChosen] = useState('disasters');
    const [notificationsToShow, setNotificationsToShow] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    
    // function to fetch notifications for logged in user
    const fetchNotifications = useCallback(async (userId, notifTypeToFetch) => {
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
            setNotificationsToShow([...data]);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        if(user){
            try{
                if(notifCategoryChosen == 'disasters'){
                    fetchNotifications(user.id, 'disaster_notification');
                }
                else if(notifCategoryChosen == 'followers'){
                    fetchNotifications(user.id, 'follow_notification');
                }
            }
            catch(error){
                showErrorToast('Failed to fetch notification', error.message ?? error);
            }
        }
        
        setRefreshing(false);
    }, [user, notifCategoryChosen, fetchNotifications]);

    useEffect(()=>{
        if(user){
            try{
                if(notifCategoryChosen == 'disasters'){
                    fetchNotifications(user.id, 'disaster_notification');
                }
                else if(notifCategoryChosen == 'followers'){
                    fetchNotifications(user.id, 'follow_notification');
                }
            }
            catch(error){
                showErrorToast('Failed to fetch notification', error.message ?? error);
            }
        }
    }, [user, notifCategoryChosen, fetchNotifications]);

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
                <View style={styles.pullToRefreshTextContainer}>
                    {/* rotating arrow icon */}
                    <RotateCw color={'#2D3782'} />

                    {/* Pull down to refresh text */}
                    <Text style={styles.pullToRefreshTxt}>
                        {t('notifScreen.pullDownToRefresh')}
                    </Text>
                </View>
                
                {/* list of notifications */}
                {
                (notificationsToShow.map((item, index) => (
                    // container of each notification
                    <View key={index} style={styles.notificationItemContainer}>
                        {/* the notification's text */}
                        <Text style={styles.notificationItemTxt}>
                            {item.body}
                        </Text>

                        {/*
                            show button according to condition:
                            - if user is viewing disasters notification, show 'Details' button on the notification item
                            - if user is viewing followers notification and the users are not yet mutuals, show 'Follow Back' button
                            - otherwise, don't show the button (i.e. if users are now mutuals, don't show follow back button)
                         */}
                        { 
                            notifCategoryChosen == 'disasters' ? 
                                                    (
                                                        <TouchableOpacity style={styles.notificationItemBtn}> 
                                                            <Text style={styles.notificationItemBtnTxt}>
                                                                {t('shared.details')}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ) : 
                                                    (notifCategoryChosen == 'followers' && item.users_are_now_mutuals == false) && 
                                                    (
                                                        <TouchableOpacity style={styles.notificationItemBtn}> 
                                                            <Text style={styles.notificationItemBtnTxt}>
                                                              {t('notifScreen.followBack')}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )
                        }
                    </View>
                )))
               }
            </ScrollView>
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
        columnGap: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
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
    }
})
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { Check } from 'lucide-react-native';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function EmergencyBagScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.resolvedLanguage;
    const [emergencyBagData, setEmergencyBagData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxToggle = async (itemId, userId) => {
        setIsLoading(true);

        // get the index of the toggled item
        const itemToggledIndex = emergencyBagData.findIndex(item => item.item_id === itemId);

        // if toggle item is found handle update
        if(itemToggledIndex != -1){
            if(emergencyBagData[itemToggledIndex].is_checked == false){
                //alert('this is unchecked');
                
                // add item to user's emergency bag data
                const {data, error} = await supabase.schema('users')
                                                    .from('users_checked_emergency_items')
                                                    .insert({item_id: itemId, user_id: userId});

                if(error){
                    showErrorToast(t('emergencyBagScreen.failedToAddEmergencyBagItem'), 
                                   `${error.message ?? JSON.stringify(error)}`);
                    return;
                }
                else{
                    // update emergency bag data state so that the item is checked
                    setEmergencyBagData(emergencyBagData.map(item => {
                        if (item.item_id === itemId) {
                            return { ...item, is_checked: true };
                        }
                        else {
                            return item;
                        }
                    }));
                }
            }
            else if(emergencyBagData[itemToggledIndex].is_checked == true){
                // remove item from user's emergency bag data
                const {error} = await supabase.schema('users')
                                              .from('users_checked_emergency_items')
                                              .delete()
                                              .eq('item_id', itemId)
                                              .eq('user_id', userId);

                if(error){
                    showErrorToast(t('emergencyBagScreen.failedToRemoveEmergencyBagItem'), 
                                   `${error.message ?? JSON.stringify(error)}`);
                    return;
                }
                else{
                    // update emergency bag data state so that the item is unchecked
                    setEmergencyBagData(emergencyBagData.map(item => {
                        if (item.item_id === itemId) {
                            return { ...item, is_checked: false };
                        }
                        else {
                            return item;
                        }
                    }));
                }
            }
        }
        else{
            showErrorToast(t('emergencyBagScreen.itemNotFound'), '');
        };

        setIsLoading(false);
    };

    useEffect(() => {
        /* function to fetch all emergency bag items 
           along with data about if they're 
           checked by the user */
        const fetchUserEmergencyBagData = async() => {
            const {data, error} = await supabase.schema('public')
                                                .rpc('get_auth_user_emergency_bag_data');

            if(error){
                showErrorToast(t('emergencyBagScreen.failedToFecthEmergencyBagData'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                setEmergencyBagData(data);
            }
        };

        if(user?.id){
            /* get the emergency bag items and data 
               about if they're checked items */
            fetchUserEmergencyBagData();
        }
    }, [user?.id]);

    return(
        <View style={[styles.screenContainer, 
                     {paddingLeft: insets.left, 
                      paddingRight: insets.right}]}>
            <ScrollView style={styles.itemsListScrollView}
                        contentContainerStyle={[styles.itemsListScrollViewContentContainer,
                                                {paddingBottom: insets.bottom + 100}
                        ]}>
                {/* explanation text about how the feature affects XP */}
                <Text style={styles.xpExplanationTxt}>
                    {t('emergencyBagScreen.explanationTxt')}
                </Text>

                {/* list of the emergency bag items */}
                {
                    emergencyBagData?.map((item, index) => (
                        <View key={index} style={styles.emergencyBagItemContainer}>
                            {/* the 'checkbox' circle */}
                            <TouchableOpacity style={styles.checkboxCircle}
                                              onPress={()=>{handleCheckboxToggle(item?.item_id, user?.id)}}
                                              accessibilityRole='button'
                                              accessibilityLabel={item.is_checked == false ? 
                                                                  t('emergencyBagScreen.tickCheckboxAccLabel') : 
                                                                  t('emergencyBagScreen.untickCheckboxAccLabel')}>
                                {
                                    item.is_checked == true && (
                                        <Check color='white' />
                                    )
                                }
                            </TouchableOpacity>

                            {/* the item name */}
                            <Text style={styles.itemNameTxt}>
                                {currentLang == 'id' ? 
                                 item.item_name_idn :
                                 item.item_name}
                            </Text>
                        </View>
                    ))
                }
            </ScrollView>

            {/* loading overlay shown when isLoading is true */}
            {
                isLoading && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    // scroll view for required items in the bag
    itemsListScrollView: {
       flex: 1
    },
    /* content container of scroll view for 
       required items in the bag */
    itemsListScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 25,
        maxWidth: 350,
        paddingHorizontal: 30,
        paddingTop: 30
    },
    // container of each emergency bag item in the list
    emergencyBagItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#D2DAE4',
        borderRadius: 20,
        elevation: 2,
        width: '100%'
    },
    // explanation text about XP and checklist
    xpExplanationTxt: {
        color: '#2D3782',
        fontSize: 16
    },
    // the 'checkbox' cicles
    checkboxCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#2D3782'
    },
    // the text showing item names in the list
    itemNameTxt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600',
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1
    }
});
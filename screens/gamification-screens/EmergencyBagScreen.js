import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { Check } from 'lucide-react-native';

export function EmergencyBagScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.resolvedLanguage;
    const [emergencyBagData, setEmergencyBagData] = useState([]);

    const handleCheckboxToggle = (itemId, userId) => {
        // get the index of the toggled item
        const itemToggledIndex = emergencyBagData.findIndex(item => item.item_id === itemId);

        // if toggle item is found handle update
        // TODO: continue
        if(itemToggledIndex != -1){
            if(emergencyBagData[itemToggledIndex].is_checked == false){
                alert('this is unchecked')
            }
            else if(emergencyBagData[itemToggledIndex].is_checked == true){
                alert('this is checked')
            }
        }
        else{
            showErrorToast(t('emergencyBagScreen.itemNotFound'), '');
        }
    };

    useEffect(() => {
        const fetchUserEmergencyBagData = async() => {
            const {data, error} = await supabase.schema('public')
                                                .rpc('get_auth_uuser_emergency_bag_data');

            if(error){
                showErrorToast(t('emergencyBagScreen.failedToFecthEmergencyBagData'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                setEmergencyBagData(data);
            }
        };

        if(user?.id){
            fetchUserEmergencyBagData();
        }
    }, [user?.id]);

    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.itemsListScrollView}
                        contentContainerStyle={styles.itemsListScrollViewContentContainer}>
                <Text style={styles.xpExplanationTxt}>
                    {t('emergencyBagScreen.explanationTxt')}
                </Text>
                {
                    emergencyBagData?.map((item, index) => (
                        <View key={index} style={styles.emergencyBagItemContainer}>
                            <TouchableOpacity style={styles.checkboxCircle}
                                              onPress={()=>{handleCheckboxToggle(item?.item_id, user?.id)}}>
                                {
                                    item.is_checked == true && (
                                        <Check color='white' />
                                    )
                                }
                            </TouchableOpacity>

                            <Text style={styles.itemNameTxt}>
                                {currentLang == 'id' ? 
                                 item.item_name_idn :
                                 item.item_name}
                            </Text>
                        </View>
                    ))
                }
            </ScrollView>
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
        paddingTop: 30,
        paddingBottom: 100,
        paddingHorizontal: 30,
        rowGap: 25,
        maxWidth: 350
    },
    // container of each emergency bag item in the list
    emergencyBagItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#D2DAE4',
        borderRadius: 20,
        elevation: 2
    },
    // explanation text about XP and checklist
    xpExplanationTxt: {
        color: '#2D3782'
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
        fontSize: 15,
        fontWeight: '600',
        width: '100%'
    }
})

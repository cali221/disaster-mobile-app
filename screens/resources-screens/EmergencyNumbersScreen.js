import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView, 
         Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';

export function EmergencyNumbersScreen() {
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    /* emergency numbers data, store it here 
       so it's available offline without downloads */
    const emergencyNumbers = [{name: t('emergencyNumbersScreen.emergency'), phoneNum: '112'},
                              {name: t('emergencyNumbersScreen.firefighter'),  phoneNum: '113'},
                              {name: t('emergencyNumbersScreen.searchRescue'), phoneNum: '115'},
                              {name: `${t('emergencyNumbersScreen.ambulance')} (${t('shared.option')} 1)`, 'phoneNum': '118'},
                              {name: `${t('emergencyNumbersScreen.ambulance')} (${t('shared.option')} 2)`, 'phoneNum': '119'},
                              {name: t('emergencyNumbersScreen.police'), phoneNum: '110'},
                              {name: t('emergencyNumbersScreen.naturalDisasterCommandPost'), phoneNum: '129'},
                              {name: t('emergencyNumbersScreen.bnpbCallCenter'), phoneNum: '117'},
                              {name: t('emergencyNumbersScreen.pln'), phoneNum: '123'},
                              {name: t('emergencyNumbersScreen.komnasHAM'), phoneNum: '021-3925230'},
                              {name: t('emergencyNumbersScreen.komnasPerempuan'), phoneNum: '021-3903963'},
                              {name: t('emergencyNumbersScreen.kpai'), phoneNum: '021-31901556'}]
    return(
        <View style={styles.screenContainer}>
            {/* list of emergency numbers */}
            <ScrollView style={styles.screenScrollView} 
                        contentContainerStyle={[styles.screenScrollViewContentContainer, 
                                                {paddingBottom: insets.bottom + 60, 
                                                 paddingHorizontal: 30, 
                                                 paddingTop: 30}]}>
                {
                    emergencyNumbers.map((item, index) => (
                        <View key={index} 
                              style={styles.emergencyNumberItemContainer}>
                            <View style={styles.emergencyNumberItemTextsContainer}>
                                {/* the emergeny number's name e.g. Ambulance */}
                                <Text style={styles.emergencyNumberNameTxt}>
                                    {item?.name}
                                </Text>

                                <Text style={styles.phoneNumberTxt}>
                                    {item?.phoneNum}
                                </Text>
                            </View>

                            {/* button to call the number 
                                (opens the 'phone' app on the device) */}
                            <TouchableOpacity style={styles.callBtn}
                                              onPress={()=>{Linking.openURL(`tel:${item?.phoneNum}`)}}>
                                <Phone fill={'#AB5C82'} size={33} stroke={'#2D3782'} />

                                <Text style={styles.callTxt}>
                                    {t('emergencyNumbersScreen.call')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                }
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    // container of the screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    /* scroll view for displaying 
       list of emergency numbers */
    screenScrollViewContentContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 25,
        maxWidth: 350
    },
    /* container of each emergency 
       number item on the list */
    emergencyNumberItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: 20,
        alignItems: 'center',
        borderWidth: 2,
        padding: 20,
        borderRadius: 20,
        borderColor: '#2D3782',
        width: '100%',
        backgroundColor: 'white'
    },
    /* container of text showing the emergency 
       number and its name for each emergency 
       number item in the list */
    emergencyNumberItemTextsContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        rowGap: 10,
        flex: 1
    },
    // the button to call the emergency number 
    callBtn: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 5
    },
    /* 'Call' text inside the button 
       to call the emergency number */
    callTxt: {
        color: '#2D3782',
        fontSize: 16
    },
    /* text showing the name of the 
       emergency number e.g. Ambulance */
    emergencyNumberNameTxt: {
        fontWeight: '600',
        fontSize: 18,
        color: '#2D3782',
    },
    /* text showing the phone numbers */
    phoneNumberTxt: {
        fontSize: 18,
        color: '#2D3782',
    }
});

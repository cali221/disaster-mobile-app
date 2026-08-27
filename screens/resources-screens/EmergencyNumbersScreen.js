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
    const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage);

    /* update language when screen is in focus, 
       to display emergency numbers names according 
       to the current language used */
    useEffect(()=>{
        if(isFocused == true){
            setCurrentLang(i18n.resolvedLanguage);
        }
    }, [isFocused])

    /* emergency numbers data, store it here 
       so it's available offline without downloads */
    const emergencyNumbers = [{name: 'Emergency', nameIdn: 'Darurat',phoneNum: '112'},
                              {name: 'Firefighter', nameIdn: 'Pemadam Kebakaran',  phoneNum: '113'},
                              {name: 'Search and Rescue', nameIdn: 'SAR/BASARNAS', phoneNum: '115'},
                              {name: 'Ambulance (option 1)', nameIdn: 'Ambulans (opsi 1)', 'phoneNum': '118'},
                              {name: 'Ambulance (option 2)', nameIdn: 'Ambulans (opsi 2)', 'phoneNum': '119'},
                              {name: 'Police', nameIdn: 'Polisi', phoneNum: '110'},
                              {name: 'Natural Disaster Command Post', nameIdn: 'Posko Bencana Alam', phoneNum: '129'},
                              {name: 'Call Center BNPB', nameIdn: 'Call Center BNPB', phoneNum: '117'},
                              {name: 'PLN (Perusahaan Listrik Negara)', nameIdn: 'PLN (Perusahaan Listrik Negara)', phoneNum: '123'},
                              {name: 'National Commission on Human Rights (Komnas HAM)', nameIdn: 'Komisi Nasional Hak Asasi Manusia (Komnas HAM)', phoneNum: '021-3925230'},
                              {name: 'National Commission on Violence Against Women (Komnas Perempuan)', nameIdn: 'Komisi Nasional Anti Kekerasan terhadap Perempuan (Komnas Perempuan)', phoneNum: '021-3903963'},
                              {name: 'Indonesian Child Protection Commission (KPAI)', nameIdn: 'Komisi Perlindungan Anak Indonesia (KPAI)', phoneNum: '021-31901556'}];
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
                                    {currentLang == 'id' ? item?.nameIdn : item?.name}
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
                                    {t('emergencyNumersScreen.call')}
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

import { Text, 
         View, 
         StyleSheet, 
         TouchableOpacity, 
         Dimensions, 
         Linking } from 'react-native';
import { BellRing, Bell } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import * as SMS from 'expo-sms';
import { getUserCurrentLocation } from '../utils/users-utilities';
import { showSuccessToast, 
         showErrorToast, 
         showInfoToast} from '../utils/show-toast';
import { LoadingOverlay } from '../components/LoadingOverlay';

// SOS sound source
const sosSoundSource = require('../assets/audio/sos-sound/54847__izkhanilov__morse-sos.wav');

export function PanicButtonScreen() {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const sosIntervalRef = useRef(null);
    const [isSoundingSOS, setIsSoundingSOS] = useState(false);
    const sosSoundPlayer = useAudioPlayer(sosSoundSource);
    const [isLoading, setIsLoading] = useState(false);

    // function to pay SOS sound
    const playSOS = () => {
        sosSoundPlayer.seekTo(0);
        sosSoundPlayer.play();
        return playSOS;
    };

    // function to start sounding SOS
    const startSOS = () => {
        setIsSoundingSOS(true);

        /*  interval needs to be long enough so sound has 
            enough time to play fully and there is a 
            little pause between each play */
        sosIntervalRef.current = setInterval(playSOS(), 3000);
    };

    // function to stop SOS sound
    const stopSOS = () => {
        sosSoundPlayer.pause();
        clearInterval(sosIntervalRef.current);
        setIsSoundingSOS(false);
    };

    const sendSMSToTrustedContacts = async() => {
        // status of availability of SMS on the device
        const smsIsAvailable = await SMS.isAvailableAsync();

        // get trusted contacts from async storage
        const trustedContactsDataStr = await AsyncStorage.getItem('trustedContacts');
        const trustedContactsData = JSON.parse(trustedContactsDataStr);

        if(!trustedContactsData){
            showInfoToast(t('panicButtonScreen.couldntGetTrustedContacts'), '');
        }
        else{
            // get only the phone numbers
            const phoneNumsToSendSMSTo = trustedContactsData.map((item)=> item.phone_num);

            /* send SMS if it's available on the device and 
            user has at least one saved trusted contact */
            if (smsIsAvailable == true && trustedContactsData.length > 0) {
                setIsLoading(true);
                
                let message;
                let location;

                // get user's current location data
                try{
                    location = await getUserCurrentLocation();
                }
                catch(error){
                    location = null;
                }

                // set message to send accordingly
                if(location !== null){
                    message = t('panicButtonScreen.emergencyMessageWithCoords', 
                                {latitude: location?.coords?.latitude, 
                                longitude: location?.coords?.longitude});
                }
                else{
                    message = t('panicButtonScreen.emergencyMessageWithoutCoords');
                }

                // open the SMS app on the device with phone numbers and message ready
                const { result } = await SMS.sendSMSAsync(phoneNumsToSendSMSTo, message);

                setIsLoading(false);

                // show toasts according to result
                if(result == 'sent'){
                    showSuccessToast(t('panicButtonScreen.smsSent'), 
                                    t('panicButtonScreen.smsSentToNContacts', 
                                    {contactNum: phoneNumsToSendSMSTo.length}));
                }
                else if(result == 'cancelled'){
                    showInfoToast(t('panicButtonScreen.smsCancelled'), '')
                }
                else if(result == 'unknown'){
                    showInfoToast(t('panicButtonScreen.smsStatusUndetermined'), '')
                }
                else{
                    showErrorToast(t('panicButtonScreen.somethineWentWrongWhenSMS'), '');
                }
            } 
            else if(smsIsAvailable == false) {
                showInfoToast(t('panicButtonScreen.smsUnavailable'), 
                            t('panicButtonScreen.smsUnavailableOnDevice'));
            }  
            else if(trustedContactsData.length < 1){
                showInfoToast(t('panicButtonScreen.noTrustedContacts'), '');
            }
        }
    };

    // handle stopping/sounding SOS sound
    useEffect(()=>{
        if(isSoundingSOS == true){
            startSOS();
        }
        else{
            stopSOS();
        }
    }, [isSoundingSOS]);

    useEffect(()=>{
        // clear SOS sound interval on unmount
       return ()=> clearInterval(sosIntervalRef.current);
    }, []);

    return(
        <View style={styles.screenContainer}>
            <ScrollView contentContainerStyle={[styles.scrollViewContentContainer, 
                                               {paddingBottom: insets.bottom + 30, 
                                                paddingTop: insets.top + 30, 
                                                paddingLeft: insets.left, 
                                                paddingRight: insets.right}]}
                        style={styles.scrollContainer}>
                {/* button to play/stop SOS sound */}
                <TouchableOpacity onPress={()=>{setIsSoundingSOS(!isSoundingSOS)}}
                                  style={styles.sosBtn}>
                    {
                        isSoundingSOS == false ? 
                        (
                            <Bell size={70} stroke={'white'} />
                        ):
                        (
                            <BellRing size={70} stroke={'white'} />
                        )
                    }
                </TouchableOpacity>

                {/* explanation texts about SOS sound */}
                {
                    isSoundingSOS == false ? 
                    (
                        <Text style={styles.sosExplanationTxt}>
                            {t('panicButtonScreen.soundSOS')}
                        </Text>
                    ):
                    (
                        <Text style={styles.sosExplanationTxt}>
                            {t('panicButtonScreen.stopSOS')}
                        </Text>
                    )
                }

                {/* button to call 112 */}
                <TouchableOpacity style={styles.contactBtns}
                                  onPress={()=>{Linking.openURL(`tel:112`)}}>
                    <Text style={styles.contactBtnsTxt}>
                        {t('panicButtonScreen.call12')}
                    </Text>
                </TouchableOpacity>

                {/* button to send SMS to trusted contacts */}
                <TouchableOpacity style={styles.contactBtns}
                                  onPress={()=>{sendSMSToTrustedContacts()}}>
                    <Text style={styles.contactBtnsTxt}>
                        {t('panicButtonScreen.sendSMS')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* loading overlay shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }

        </View>
    )
};

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    /* content container of the scroll container 
       of the screen content */
    scrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        rowGap: 25
    },
    // the scroll container of screen content
    scrollContainer: {
        width: '100%'
    },
    // button to sound SOS
    sosBtn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: (Dimensions.get('window').height * 0.20),
        height: (Dimensions.get('window').height * 0.20),
        borderRadius: (Dimensions.get('window').height * 0.20)/2,
        backgroundColor: '#AB5C82',
        elevation: 5
    },
    // explanation text about SOS sound
    sosExplanationTxt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        width: '60%'
    },
    /* the button to send SMS to trusted 
       contacts and the button to call 112 */
    contactBtns: {
        backgroundColor: '#2D3782',
        padding: 7,
        width: '70%',
        minHeight: (Dimensions.get('window').height * 0.07),
        maxWidth: 350,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 17,
        elevation: 2
    },
    /* the text inside the button to send SMS to trusted 
       contacts and the button to call 112 */
    contactBtnsTxt: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600'
    },
});
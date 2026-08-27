import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { BellRing, Bell } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import * as SMS from 'expo-sms';
import { showSuccessToast, 
         showErrorToast, 
         showInfoToast} from '../utils/show-toast';

const sosSoundSource = require('../assets/audio/sos-sound/54847__izkhanilov__morse-sos.wav');

export function PanicButtonScreen() {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const sosIntervalRef = useRef(null);
    const [isSoundingSOS, setIsSoundingSOS] = useState(false);
    const sosSoundPlayer = useAudioPlayer(sosSoundSource);
    sosSoundPlayer.volume = 9.0;

    // function to pay SOS sound
    const playSOS = () => {
        sosSoundPlayer.seekTo(0);
        sosSoundPlayer.play();
        return playSOS;
    }

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
        const smsIsAvailable = await SMS.isAvailableAsync();

        // get trusted contacts from async storage
        const trustedContactsData = await AsyncStorage.getItem('trustedContacts');

        if (smsIsAvailable) {
            // get only the phone numbers
            const phoneNumsToSendSMSTo = JSON.parse(trustedContactsData).map((item)=>{return item.phone_num});

            // open the SMS app on the device with phone numbers and message ready
            const { result } = await SMS.sendSMSAsync(phoneNumsToSendSMSTo, t('panicButtonScreen.emergencyMessage'));

            // show toasts according to result
            if(result == 'sent'){
                showSuccessToast(t('panicButtonScreen.smsSent'), 
                                 t('panicButtonScreen.smsSentToNContacts', {contactNum: phoneNumsToSendSMSTo.length}));
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
        else {
            showErrorToast(t('panicButtonScreen.smsUnavailable'), 
                           t('panicButtonScreen.smsUnavailableOnDevice'));
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
        <View style={[styles.screenContainer, 
                      {paddingBottom: insets.bottom, 
                       paddingTop: insets.top, 
                       paddingLeft: insets.left, 
                       paddingRight: insets.right}]}>
            <ScrollView contentContainerStyle={styles.scrollViewContentContainer}
                        style={styles.scrollContainer}>
                {/* button to play/stop SOS sound */}
                <TouchableOpacity onPress={()=>{setIsSoundingSOS(!isSoundingSOS)}}
                                  style={styles.sosBtn}>
                    {
                        isSoundingSOS == false ? 
                        (
                            <Bell size={100} stroke={'white'} />
                        ):
                        (
                            <BellRing size={100} stroke={'white'} />
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
        height: '100%',
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
        width: (Dimensions.get('window').height * 0.22),
        height: (Dimensions.get('window').height * 0.22),
        borderRadius: (Dimensions.get('window').height * 0.22)/2,
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
        padding: 15,
        width: '65%',
        height: (Dimensions.get('window').height * 0.08),
        maxHeight: 85,
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
        fontSize: 17,
        fontWeight: '600'
    },
});
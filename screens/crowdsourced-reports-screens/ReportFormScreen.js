import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Skull, Smile, Frown, Meh, MapPin, ChevronDown} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { showErrorToast, showInfoToast } from '../../utils/show-toast'; 
import * as Location from 'expo-location';
import { roundTo2DP } from '../../utils/rounding';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { LocationSearchAndPicker } from '../../components/modals/LocationSearchAndPickerModal';

export function ReportFormScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const [locationText, setLocationText] = useState('Please pick a location');
    const [pickedLocationObj, setPickedLocationObj] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldShowLocPickerModal, setShouldShowLocPickerModal] = useState(false);
    const [pickedSeverity, setPickedSeverity] = useState(null);

    const setPickedLocation = (locId, 
                               adm3, 
                               cityOrRegency, 
                               province, 
                               distInMetersFromArea, 
                               isContainedInArea,
                               isPickedFromCurrentLoc) => {
        setPickedLocationObj({'ogc_fid': locId, 
                              'adm3': adm3, 
                              'cityOrRegency': cityOrRegency, 
                              'province': province});

        if(isContainedInArea == null || isContainedInArea == true){
            setLocationText(t('reportFormScreen.locationNormal', 
                              {adm3: adm3, 
                               cityOrRegency: cityOrRegency, 
                               province: province}));
        }
        else if(isContainedInArea == false && isPickedFromCurrentLoc == true){
            setLocationText(t('reportFormScreen.userLocationWhenNotContainedInArea', 
                              {adm3: adm3, 
                               cityOrRegency: cityOrRegency, 
                               province: province,
                               distance: roundTo2DP(distInMetersFromArea/1000)}));
        }
    };

    const getUserLocation = async()=> {
      setIsLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showInfoToast(t('permissions.permissionNeeded'), 
                      t('permissions.permissionNeededToGetLocation'));
        return;
      }
      else{
        let location = await Location.getCurrentPositionAsync({});
        
        if(location?.coords?.latitude && location?.coords?.longitude){
            const {data, error} = await supabase.schema('public')
                                                .rpc('get_adm3_from_coords', 
                                                     {lat_input: location.coords.latitude, 
                                                      lon_input: location.coords.longitude})
                                                .single();
            if(error){
                console.log(error.message)
            }    
            else{
                if(data){
                    console.log(data);
                    setPickedLocation(data?.ogc_fid, 
                                      data?.adm3, 
                                      data?.city_or_regency, 
                                      data?.province, 
                                      data?.dist_in_m_from_area, 
                                      data?.contained_in_area, 
                                      true);
                }
            }
        }
      }

      setIsLoading(false);
    }
    
    return(
        <View style={styles.screenContainer}>
            {/* scroll view for the form content */}
            <ScrollView contentContainerStyle={[styles.formScrollContentContainer, 
                                                {paddingTop: 30, 
                                                 paddingBottom: insets.bottom + 80}]}>

                {/* location input section */}
                <View style={styles.locationInputSection}>
                    {/* heading text */}
                    <Text style={styles.sectionHeadingTxt}>
                        {t('shared.location')}
                    </Text>

                    {/* explanation text for the location input */}
                    <Text style={styles.bestEstimateTxt}>
                        {t('reportFormScreen.locationBestEstimateExplanation')}
                    </Text>

                    {/* location search area */}
                    <View style={styles.locationSearchContainer}>
                        {/* location picker, shows picker modal when pressed */}
                        <TouchableOpacity style={styles.locationPickerBtn}
                                          onPress={()=>{setShouldShowLocPickerModal(true)}}>
                            <Text style={styles.pickLocationTxt}>
                                {t('reportFormScreen.pickALoc')}
                            </Text>

                            {/* 'dropdown' icon */}
                            <ChevronDown color={'#2D3782'} size={30} />
                        </TouchableOpacity>           
                    </View>
                    
                    {/* button to use user's current location */}
                    <TouchableOpacity style={styles.useCurrentLocBtn} 
                                      onPress={()=>{getUserLocation()}}>
                        <Text style={styles.useCurrentLocBtnTxt}>
                            {t('reportFormScreen.useCurrentLocation')}
                        </Text>
                    </TouchableOpacity>

                    {/* the picked location */}
                    <View style={styles.pickedLocationContainer}>
                        {/* map pin icon */}
                        <MapPin size={30} fill={'white'} stroke={'#2D3782'} />

                        {/* picked location text */}
                        <Text style={styles.pickedLocationTxt}>
                            {locationText ? locationText : t('reportFormScreen.pleasePickALocation')}
                        </Text>
                    </View>
                </View>

                {/* perveived severity section */}
                <View style={styles.perceivedSeveritySection}>
                    {/* heading text */}
                    <Text style={styles.sectionHeadingTxt}>
                        {t('reportFormScreen.perceivedSeverity')}
                    </Text>

                    {/* input container */}
                    <View style={styles.perceivedSeverityInputArea}>
                        {/* 'didn't feel or see' option button */}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(0)}}
                                      style={styles.severityBtn}>
                            <Smile size={55} 
                                fill={pickedSeverity == 0 ? '#9ec110' : 'transparent'}
                                stroke={'#2D3782'} />

                            <Text style={styles.severityTxt}>
                                {t('reportFormScreen.didntFeelOrSee')}
                            </Text>
                        </TouchableOpacity>

                        {/* 'not too bad' option button */}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(1)}}
                                        style={styles.severityBtn}>
                            <Meh size={55} 
                                fill={pickedSeverity == 1 ? '#9ec110' : 'transparent'}
                                stroke={'#2D3782'} />
                            <Text style={styles.severityTxt}>
                                {t('reportFormScreen.notThatBad')}
                            </Text>
                        </TouchableOpacity>

                        {/* 'bad' option button*/}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(2)}}
                                        style={styles.severityBtn}>
                            <Frown size={55} 
                                fill={pickedSeverity == 2 ? '#9ec110' : 'transparent'}
                                stroke={'#2D3782'} />

                            <Text style={styles.severityTxt}>
                                {t('reportFormScreen.bad')}
                            </Text>
                        </TouchableOpacity>

                        {/* 'very bad' option button */}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(3)}}
                                        style={styles.severityBtn}>
                            <Skull size={55} 
                                fill={pickedSeverity == 3 ? '#9ec110' : 'transparent'}
                                stroke={'#2D3782'} />

                            <Text style={styles.severityTxt}>
                                {t('reportFormScreen.veryBad')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* description section */}
                <View style={styles.descriptionSection}>
                    {/* heading text */}
                    <Text style={styles.sectionHeadingTxt}>
                        {t('reportFormScreen.description')} ({t('shared.optional')})
                    </Text>

                    {/* description text input */}
                    <TextInput style={styles.descriptionTxtInput} 
                               multiline={true} />
                </View>

                {/* section for submitting report */}
                <View style={styles.submitSection}>
                    {/* explanation text about what will 
                        happen when report is submitted */}
                    <Text style={styles.submitExplanationTxt}>
                        {t('reportFormScreen.submitExplanation')}
                    </Text>

                    {/* button to submit report */}
                    <TouchableOpacity style={styles.submitBtn}>
                        <Text style={styles.submitBtnTxt}>
                            {t('shared.submit')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* loading overlay shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }

            {/* location picker modal, shown only when 
                shouldShowLocPickerModal is true */}
            {
                shouldShowLocPickerModal == true && (
                    <LocationSearchAndPicker title={t('reportFormScreen.pickALoc')}
                                             hideBadgeModalFunc={()=>{setShouldShowLocPickerModal(false)}}
                                             handleLocationPressFunc={setPickedLocation}
                                             modalHeight={'90%'} />
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
        paddingHorizontal: 30
    },
    // content container of the form's scroll view
    formScrollContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: 'center',
        rowGap: 30
    },
    // location input section container
    locationInputSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    // location search area container
    locationSearchContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: 20
    },
    bestEstimateTxt: {
        color: '#2D3782',
    },
    /* button to open a modal to 
       search and pick a location */
    locationPickerBtn: {
        borderColor: '#2D3782',
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderRadius: 20,
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10
    },
    // button to use the user's current location
    useCurrentLocBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    /* text inside button to use 
       the user's current location */
    useCurrentLocBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    /* container of the picked location 
       (containing picked location text and map pin icon) */
    pickedLocationContainer: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 7,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 10
    },
    // text showing the picked location
    pickedLocationTxt: {
        fontWeight: '600',
        fontSize: 17,
        color: '#2D3782',
        flex: 1
    },
    pickLocationTxt: {
        color: '#2D3782'
    },
    perceivedSeverityInputArea: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
    }, 
    severityBtn: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1 
    },
    severityTxt: {
        fontSize: 16,
        textAlign: 'center',
        width: '100%',
        color: '#2D3782'
    },
    perceivedSeveritySection: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 15,
        justifyContent: 'flex-start'
    },
    sectionHeadingTxt: {
        fontWeight: '600',
        fontSize: 20,
        color: '#2D3782'
    },
    descriptionSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    descriptionTxtInput: {
        borderWidth: 1,
        borderColor: '#2D3782',
        borderRadius: 10,
        padding: 7,
        color: '#2D3782',
    },
    submitSection: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12
    },
    submitBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    submitExplanationTxt: {
        color: '#2D3782',
    }
});

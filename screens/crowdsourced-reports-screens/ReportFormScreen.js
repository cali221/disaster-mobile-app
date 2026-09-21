import { Text, View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { MapPin, ChevronDown} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { showErrorToast, showInfoToast, showSuccessToast } from '../../utils/show-toast'; 
import { getUserCurrentLocation } from '../../utils/users-utilities';
import { roundTo2DP } from '../../utils/rounding';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { LocationSearchAndPicker } from '../../components/modals/LocationSearchAndPickerModal';
import { DataAttributionSection } from '../../components/DataAttributionSection';
import { SeverityIconAndLabel } from '../../components/SeverityIconAndLabel';

export function ReportFormScreen({route, navigation}) {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const [locationText, setLocationText] = useState('Please pick a location');
    const [pickedLocationObj, setPickedLocationObj] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldShowLocPickerModal, setShouldShowLocPickerModal] = useState(false);
    const [pickedSeverity, setPickedSeverity] = useState(null);
    const [description, setDescription] = useState(null);

    // function for submitting report
    const submitReport = async(locationId, severity, description) => {
        setIsLoading(true);

        /* if there is no picked location or severity, 
           inform user they are required */
        if(locationId == null || severity == null){
            setIsLoading(false);
            showErrorToast(t('reportFormScreen.failedToSubmitReport'), 
                           t('reportFormScreen.locationAndSeverityDataRequired'));
            return;
        };

        /* insert report data to database 
           (database trigger handles XP and badges udpates) */
        const { error } = await supabase.schema('disasters_related_data')
                                        .from('user_reports')
                                        .insert({disaster_id: route?.params?.disasterId,
                                                 description: description,
                                                 severity_status_number: severity,
                                                 location_id: pickedLocationObj?.ogc_fid});

        if(error){
            showErrorToast(t('reportFormScreen.failedToSubmitReport'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            showSuccessToast(t('reportFormScreen.reportSubmitted'));
            navigation.popTo('Disaster Details', {disasterId: route?.params?.disasterId});
        }

        setIsLoading(false);
    };

    // function for setting picked location
    const setPickedLocation = (locId, 
                               adm3, 
                               cityOrRegency, 
                               province, 
                               distInMetersFromArea, 
                               isContainedInArea,
                               isPickedFromCurrentLoc) => {
        // set the location as the picked location object
        setPickedLocationObj({'ogc_fid': locId, 
                              'adm3': adm3, 
                              'cityOrRegency': cityOrRegency, 
                              'province': province});

        // set the location text for display accordingly
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

    // function to handle location pick on picker modal
    const handleLocPickedFromPicker = (locObj) => {
        setPickedLocation(locObj.ogc_fid, 
                          locObj.adm3_name, 
                          locObj.adm2_name, 
                          locObj.province, 
                          null, 
                          null,
                          false)
    }

    // function to get user's location and update the picked location
    const getUserLocation = async()=> {
      setIsLoading(true);

      try{
        // get the user's curren location data
        const location = await getUserCurrentLocation();

        // get the location name from the database
        const {data, error} = await supabase.schema('public')
                                            .rpc('get_adm3_from_coords', 
                                                    {lat_input: location?.coords?.latitude, 
                                                     lon_input: location?.coords?.longitude})
                                            .single();
        if(error){
            throw error;
        }    
        else{
            if(data){
                console.log(data);

                // updated picked location
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
      catch(error){
        if(error.message == 'No permission to access location'){
            showInfoToast(t('permissions.permissionNeeded'), 
                          t('permissions.permissionNeededToGetLocation'));
        }
        else{
            showErrorToast(t('reportFormScreen.failedToFetchCurrentLocation'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
      }

      setIsLoading(false);
    };
    
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

                    {/* location data attribution */}
                    <DataAttributionSection attributionTxt={t('reportFormScreen.dataAttribution')} />    
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

                            <SeverityIconAndLabel iconSize={55} 
                                                  iconFillColor={pickedSeverity == 0 ? '#9ec110' : 'transparent'}
                                                  iconStrokeColor={'#2D3782'}
                                                  severityValue={0} />
                        </TouchableOpacity>

                        {/* 'not too bad' option button */}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(1)}}
                                          style={styles.severityBtn}>
                           <SeverityIconAndLabel iconSize={55} 
                                                 iconFillColor={pickedSeverity == 1 ? '#9ec110' : 'transparent'}
                                                 iconStrokeColor={'#2D3782'}
                                                 severityValue={1} />
                        </TouchableOpacity>

                        {/* 'bad' option button*/}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(2)}}
                                          style={styles.severityBtn}>
                            <SeverityIconAndLabel iconSize={55} 
                                                  iconFillColor={pickedSeverity == 2 ? '#9ec110' : 'transparent'}
                                                  iconStrokeColor={'#2D3782'}
                                                  severityValue={2} />
                        </TouchableOpacity>

                        {/* 'very bad' option button */}
                        <TouchableOpacity onPress={()=>{setPickedSeverity(3)}}
                                          style={styles.severityBtn}>
                            <SeverityIconAndLabel iconSize={55} 
                                                  iconFillColor={pickedSeverity == 3 ? '#9ec110' : 'transparent'}
                                                  iconStrokeColor={'#2D3782'}
                                                  severityValue={3} />
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
                               multiline={true}
                               onChangeText={setDescription} />
                </View>

                {/* section for submitting report */}
                <View style={styles.submitSection}>
                    {/* explanation text about what will 
                        happen when report is submitted */}
                    <Text style={styles.submitExplanationTxt}>
                        {t('reportFormScreen.submitExplanation')}
                    </Text>

                    {/* button to submit report */}
                    <TouchableOpacity style={styles.submitBtn}
                                      onPress={()=>{submitReport(pickedLocationObj?.ogc_fid, pickedSeverity, description)}}>
                        <Text style={styles.submitBtnTxt}>
                            {t('shared.submit')} ({'+50 XP'})
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
                                             handleLocationPressFunc={handleLocPickedFromPicker}
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
    /* explanation text for location input 
       (about picking best estimate) */
    bestEstimateTxt: {
        color: '#2D3782',
        fontSize: 16
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
    /* text saying 'Pick a location' 
       on the location picker button */
    pickLocationTxt: {
        color: '#2D3782',
        fontSize: 16
    },
    /* container of the input options 
       for perceived severity */
    perceivedSeverityInputArea: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
    }, 
    // severity option button 
    severityBtn: {
        flex: 1 
    },
    // perceived severity section
    perceivedSeveritySection: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 15,
        justifyContent: 'flex-start'
    },
    // texts for section headings
    sectionHeadingTxt: {
        fontWeight: '600',
        fontSize: 20,
        color: '#2D3782'
    },
    // description section
    descriptionSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    // text input for description
    descriptionTxtInput: {
        borderWidth: 1,
        borderColor: '#2D3782',
        borderRadius: 10,
        padding: 7,
        color: '#2D3782',
    },
    /* section for submitting with submit 
       button and explanation text */
    submitSection: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12
    },
    // the submit button
    submitBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // text inside submit button
    submitBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    // explanation text about submitting
    submitExplanationTxt: {
        color: '#2D3782',
        fontSize: 16
    }
});
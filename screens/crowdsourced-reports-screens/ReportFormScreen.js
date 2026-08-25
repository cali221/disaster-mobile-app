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
    const [locationSearchInput, setLocationSearchInput] = useState(t('shared.location'));
    const [locationText, setLocationText] = useState('Please pick a location');
    const [pickedLocationObj, setPickedLocationObj] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldShowLocPickerModal, setShouldShowLocPickerModal] = useState(false);

    const setPickedLocation = (locId, 
                               adm3, 
                               cityOrRegency, 
                               province, 
                               distInMetersFromArea, 
                               isContainedInArea,
                               isPickedFromCurrentLoc) => {
        console.log(isContainedInArea);
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
                    setPickedLocation(data?.ogc_fid, 
                                      data?.adm3, 
                                      data?.city_or_regency, 
                                      data?.province, 
                                      data?.dist_in_m_from_area, 
                                      data?.contained_in_area, 
                                      true);

                    // setPickedLocationObj({'ogc_fid': data?.ogc_fid, 
                    //                       'adm3': data?.adm3, 
                    //                       'cityOrRegency': data?.city_or_regency, 
                    //                       'province': data?.province});

                    // setLocationText(data?.contained_in_area == true ? t('reportFormScreen.userLocationWhenContainedInArea', 
                    //                                                      {adm3: data?.adm3, 
                    //                                                       cityOrRegency: data?.city_or_regency, 
                    //                                                       province: data?.province}):
                    //                                                    t('reportFormScreen.userLocationWhenNotContainedInArea', 
                    //                                                      {adm3: data?.adm3, 
                    //                                                       cityOrRegency: data?.city_or_regency, 
                    //                                                       province: data?.province,
                    //                                                       distance: roundTo2DP(data?.dist_in_m_from_area/1000)}));
                }
            }
        }
      }

      setIsLoading(false);
    }
    
    return(
        <View style={styles.screenContainer}>
            <ScrollView contentContainerStyle={[styles.formScrollContentContainer, {paddingTop: 30, paddingBottom: insets.bottom + 50}]}>
                <View style={styles.locationInputSection}>
                    <View style={styles.locationSearchContainer}>
                        <TouchableOpacity style={styles.locationPickerBtn}
                                          onPress={()=>{setShouldShowLocPickerModal(true)}}>
                            <Text>
                                {t('reportFormScreen.pickALoc')}
                            </Text>

                            <ChevronDown />
                        </TouchableOpacity>           
                    </View>
                    
                    <TouchableOpacity style={styles.useCurrentLocBtn} 
                                      onPress={()=>{getUserLocation()}}>
                        <Text style={styles.useCurrentLocBtnTxt}>
                            {t('reportFormScreen.useCurrentLocation')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pickedLocationContainer}>
                        <MapPin size={30} fill={'white'} stroke={'#2D3782'} />
                        <Text style={styles.pickedLocationTxt}>{locationText}</Text>
                    </View>
                </View>

                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
                <View style={{widht: '100%', height: 150, backgroundColor: 'pink', marginBottom: 50}}></View>
              
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
        justifyContent: 'center'
    },
    // location input section container
    locationInputSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20
    },
    // location search area container
    locationSearchContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: 20
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
        justifyContent: 'space-between'
    },
    // button to use the user's current location
    useCurrentLocBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
        justifyContent: 'flex-start'
    },
    // text showing the picked location
    pickedLocationTxt: {
        fontWeight: '600',
        fontSize: 17,
        color: '#2D3782',
        flex: 1
    }
});

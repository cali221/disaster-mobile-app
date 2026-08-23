import { Text, 
         View, 
         StyleSheet, 
         Image, 
         ScrollView, 
         TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapDisasterLegend } from '../../components/MapDisasterLegend';
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native"; 
import * as mapStyle from '../../assets/map-style/style.json';
import { getDisasterTitle } from '../../utils/get-disaster-title';

export function DisasterDetailsScreen({route, navigation}) {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [disasterObj, setDisasterObj] = useState(null);
    const [disasterTitle, setDisasterTitle] = useState('');
    const { t, i18n } = useTranslation();

    const handleEvacuationGuideBtnPress = (disasterType) => {
        console.log(disasterType);

        if(disasterType == 'earthquake'){
            // navigate to earthquke guide screen
            navigation.navigate('Resource Hub Screen Stack', 
                                { screen: 'Earthquake Guide', 
                                  initial: false, 
                                  params: {}
                                });
        }
        else if(disasterType == 'flood'){
            // navigate to flood guide screen
            navigation.navigate('Resource Hub Screen Stack', 
                                { screen: 'Flood Guide', 
                                  initial: false, 
                                  params: {}
                                });
        }
        else if(disasterType == 'tsunami'){
            // navigate to tsunami screen
             navigation.navigate('Resource Hub Screen Stack', 
                                { screen: 'Tsunami Guide', 
                                  initial: false, 
                                  params: {}
                                });
        }
        else if(disasterType == 'volcano'){
            // navigate to volcano guide screen
            navigation.navigate('Resource Hub Screen Stack', 
                                { screen: 'Volcanic Eruption Guide', 
                                  initial: false, 
                                  params: {}
                                });
        }
        else if(disasterType == 'landslide'){
            // navigate to landslide guide screen
            navigation.navigate('Resource Hub Screen Stack', 
                                { screen: 'Landslide Guide', 
                                  initial: false, 
                                  params: {}
                                });
        }
        else{
            /* show toast informing the user, the application doesn't 
               include guide for the disaster type */
            showErrorToast(t('disasterDetailsScreen.disasterGuideUnavailable'), 
                           t('disasterDetailsScreen.appDoesntIncluldeGuideForDisasterType'));
        }
    };

    useEffect(()=>{
        console.log(route.params.disasterId);

        // fetch disaster details data and set the disaster title
        const fetchDisasterDetails = async(disasterId) => {
            try{
                setIsLoading(true);

                const { data, error } = await supabase.schema('public')
                                                        .rpc('get_disaster_data_for_details_screen', 
                                                            {disaster_id_input: disasterId});
                                                
                if(error){
                    throw error;
                }
                else{
                    if(data){
                        console.log(data);
                        setDisasterObj(data);
                        setDisasterTitle(getDisasterTitle(data?.area?.contained_in_area,
                                                        data?.area?.city_or_regency,
                                                        data?.area?.province,
                                                        data?.area?.dist_in_m_from_area,
                                                        data?.general?.disaster_type,
                                                        t,
                                                        i18n));
                    }
                }

                setIsLoading(false);
            }
            catch(error){
                showErrorToast(t('disasterDetailsScreen.failedToGetDisasterData'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
        };

        fetchDisasterDetails(route?.params?.disasterId);
    }, [route?.params?.disasterId]);

    return( 
        disasterObj ? (
            <View style={styles.screenContainer}>
                {/* crowdsourced reports map placeholder */}
                {/* <View style={{width: '100%', height: 200, backgroundColor: 'plum'}}></View> */}

                <Map style={{width: '100%', height: 250}} 
                     mapStyle={mapStyle}
                     compassPosition={{top: 20, left: 20}}
                     onStartShouldSetResponder={()=>{return true}}>
                    <Camera maxZoom={14} 
                            zoom={10} 
                            bounds={(disasterObj?.general?.latitude && 
                                     disasterObj?.general?.longitude) ? 
                                    [(disasterObj?.general?.longitude - 5), 
                                     (disasterObj?.general?.latitude - 5), 
                                     (disasterObj?.general?.longitude + 5), 
                                     (disasterObj?.general?.latitude + 5)] : 
                                    [93, -12, 142, 10]}
                            trackUserLocation='default' />

                    <Marker testID='disaster-marker-on-map'
                            lngLat={[disasterObj?.general?.longitude, disasterObj?.general?.latitude]}>
                        <MapDisasterLegend disasterType={disasterObj?.general?.disaster_type} />
                    </Marker>
                </Map> 

                <ScrollView contentContainerStyle={[styles.disasterInformationContainer, 
                                                    {paddingBottom: insets.bottom + 70,
                                                     paddingLeft: insets.left + 30,
                                                     paddingRight: insets.right + 30,
                                                     paddingTop: 20}]}
                            style={styles.disasterInformationScrollView}>
                    {/* title text */}
                    <Text style={styles.disasterTitleTxt}>
                        {disasterTitle}
                    </Text>

                    {/* disaster time */}
                    <Text style={styles.disasterTimeTxt}>
                        {new Date(disasterObj?.general?.datetime).toLocaleString('id', {timeZoneName: 'short'})}
                    </Text>

                    {/* image */}
                    {
                        disasterObj?.general?.img_url && (
                            <Image source={{uri: disasterObj?.general?.img_url}} 
                                   style={{width: '100%', aspectRatio: 1}}
                                   resizeMode='contain' />
                        )
                    }
                
                    {/* disaster description */}
                    {
                        disasterObj?.general?.description && (
                            <Text style={styles.descriptionTxt}>
                                {disasterObj?.general?.description}
                            </Text>
                        )
                    }

                    {/* add details text according to types, 
                        for types that have no details data, 
                        show explanation text */}
                    {
                        // earthquake details texts
                        disasterObj?.general?.disaster_type == 'earthquake' ? 
                        (
                            <View style={styles.disasterDetailsContainer}>
                                {/* magnitude */}
                                {
                                    disasterObj?.magnitude && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.magnitude')}: {disasterObj?.magnitude}
                                        </Text>
                                    )
                                }
                                
                                {/* earthquake depth */}
                                {
                                    disasterObj?.depthInKm && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.depth')}: {disasterObj?.depthInKm} km
                                        </Text>
                                    )
                                }

                                {/* earthquake potential */}
                                {
                                    disasterObj?.potentialText && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.potential')}: {disasterObj?.potentialText}
                                        </Text>
                                    )
                                }

                                {/* earthquake center description */}
                                {
                                    disasterObj?.earthquakeCenterText && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.center')}: {disasterObj?.earthquakeCenterText}
                                        </Text>
                                    )
                                }

                                {/* structural failure status, following documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                {
                                    disasterObj?.structureFailureStatus !== null && (
                                        <Text style={styles.disasterDetailsTxt}>
                                        {t('disasterDetailsScreen.structureFailureStatus')}:
                                        {' '} 
                                        {disasterObj?.structureFailureStatus == 0 ? 
                                            t('disasterDetailsScreen.cracking'):

                                            disasterObj?.structureFailureStatus == 1 ?
                                            t('disasterDetailsScreen.partialCollapse'):

                                            disasterObj?.structureFailureStatus == 2 && 
                                            t('disasterDetailsScreen.totalCollapse')}
                                        </Text>
                                    )
                                }
                                
                                {/* accessibility failure status, following documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                {
                                    disasterObj?.accessibilityFailureStatus !== null && (
                                        <Text style={styles.disasterDetailsTxt}>
                                        {t('disasterDetailsScreen.accessibilityFailureStatus')}:  
                                        {' '} 
                                        {disasterObj?.accessibilityFailureStatus == 0 ? 
                                            t('disasterDetailsScreen.noVehicleAccess'):

                                            disasterObj?.accessibilityFailureStatus == 1 ?
                                            t('disasterDetailsScreen.twoWheelsAccess'):

                                            (disasterObj?.accessibilityFailureStatus == 2 || 
                                             disasterObj?.accessibilityFailureStatus == 3) ?
                                            t('disasterDetailsScreen.fourWheelsAccess'):

                                            disasterObj?.accessibilityFailureStatus == 4 && 
                                            t('disasterDetailsScreen.largeVehicleAccess')}
                                        </Text>
                                    )
                                }
                            </View>
                        ):
                        /* flood details texts, since depth is the only metric, 
                           don't show details if there is no depth data */
                        disasterObj?.general?.disaster_type == 'flood' && disasterObj?.floodDepthInCm !== null ?
                        (
                            <View style={styles.disasterDetailsContainer}>
                                {/* flood depth */}
                                <Text style={styles.disasterDetailsTxt}>
                                    {t('disasterDetailsScreen.depth')}: {disasterObj?.floodDepthInCm} cm
                                </Text>

                                {/* severity based on flood depth, following documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                <Text style={styles.disasterDetailsTxt}>
                                    {t('disasterDetailsScreen.severity')}: {' '}
                                    {disasterObj?.floodDepthInCm < 70 ? (
                                        <Text>
                                            {t('disasterDetailsScreen.minor')}
                                        </Text>
                                    ):
                                    disasterObj?.floodDepthInCm >= 70 && disasterObj?.floodDepthInCm < 150?
                                    (
                                        <Text>
                                            {t('disasterDetailsScreen.moderate')}
                                        </Text>
                                    ):
                                    disasterObj?.floodDepthInCm >= 150 && (
                                        <Text>
                                            {t('disasterDetailsScreen.severe')}
                                        </Text>
                                    )}
                                </Text>
                            </View>
                        ):
                        disasterObj?.general?.disaster_type == 'haze' ?
                        (
                            <View style={styles.disasterDetailsContainer}>
                               {/* visibility, with number and status pairs according to documentation on:
                                   https://docs.petabencana.id/master-1/general/supported-hazards */}
                               {
                                    disasterObj?.visibility && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.visibility')}: {' '}
                                            {disasterObj?.visibility == 0 ? 
                                            t('disasterDetailsScreen.canSeeButNeedMask'):

                                            disasterObj.visibility == 1 ? 
                                            t('disasterDetailsScreen.canSeeButNotEnoughToDrive'):
                                            
                                            disasterObj?.visibility == 2 &&
                                            t('disasterDetailsScreen.canBarelySeeCantGoOut')}
                                        </Text>
                                    )
                                }
                                
                                {/* air quality, with number and status pairs according to documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                {
                                    disasterObj?.airQualityStatus && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.airQuality')}: {' '}
                                            {(disasterObj?.airQualityStatus == 0 || disasterObj?.airQualityStatus == 1) ? 
                                             t('disasterDetailsScreen.poor'):

                                             disasterObj?.airQualityStatus == 2 ? 
                                             t('disasterDetailsScreen.severe'):

                                             (disasterObj?.airQualityStatus == 3 || disasterObj?.airQualityStatus == 4) &&
                                             t('disasterDetailsScreen.hazardous')}
                                        </Text>
                                    )
                                }
                            </View>
                        ):
                        /* extreme wind details texts, since impact is the only metric, 
                           don't show details if there is no impact data */
                        disasterObj?.general?.disaster_type == 'wind' && disasterObj?.impactStatus !== null ?
                        (
                            <View style={styles.disasterDetailsContainer}>
                                {/* the impact status, with number and status pairs according to documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                <Text style={styles.disasterDetailsTxt}>
                                    {t('disasterDetailsScreen.impact')}:{' '}
                                    {disasterObj?.impactStatus == 0 ? t('disasterDetailsScreen.low'): 
                                     disasterObj?.impactStatus == 1 ? t('disasterDetailsScreen.medium'):
                                     disasterObj?.impactStatus == 2 && t('disasterDetailsScreen.high')}
                                </Text>
                            </View>
                        ):
                        disasterObj?.general?.disaster_type == 'volcano' ?
                        (
                            <View style={styles.disasterDetailsContainer}>
                                {/* number of people in the village */}
                                {
                                    disasterObj?.numberOfPeopleInVillage !== null && (
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.numPeopleInVillage')}:{' '}
                                            {disasterObj?.numberOfPeopleInVillage} 
                                        </Text>
                                    )
                                }

                                {/* volanic signs that were observed, with number and status pairs according to documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                {
                                    (disasterObj?.signsStatusObserved !== null && disasterObj?.signsStatusObserved.length > 0) &&
                                    (
                                       <View>
                                        {/* the list heading */}
                                        <Text style={styles.disasterDetailsTxt}>
                                            {t('disasterDetailsScreen.volcanicSignsObserved')}:
                                        </Text>

                                        {/* the list of signs observed */}
                                        {
                                            disasterObj?.signsStatusObserved.map((item, index) => (
                                                <Text key={index} style={styles.disasterDetailsTxt}>
                                                    • {item == 0 ? t('disasterDetailsScreen.tempRise') : 
                                                       item == 1 ? t('disasterDetailsScreen.droughtOrVegDeath') :
                                                       item == 2 ? t('disasterDetailsScreen.unusualAnimalsBehavior') :
                                                       item == 3 ? t('disasterDetailsScreen.freqEarthquakeTremors') :
                                                       item == 4 && t('disasterDetailsScreen.freqRumblingSound')}
                                                </Text>
                                            )) 
                                        }
                                       </View>
                                    )
                                }

                                {/* whether or not evacuation site is known */}
                                {disasterObj?.knowWhereToEvacuate !== null && (
                                    <Text style={styles.disasterDetailsTxt}>
                                        {t('disasterDetailsScreen.knowWhereToEvacuate')}: {' '}
                                        {disasterObj?.knowWhereToEvacuate == true ? t('shared.yes') : t('shared.no')}
                                    </Text>
                                )} 
                            </View>
                        ):
                        (
                            // TODO: add explanation
                            <Text>other</Text>
                        )
                    }

                    {/* TODO: add data attribution here */}
                </ScrollView>

                {/* menu at screen's bottom */}
                <View style={[styles.bottomMenu, {paddingBottom: insets.bottom + 30,
                                                  paddingLeft: insets.left + 30, 
                                                  paddingRight: insets.right + 30,
                                                  paddingTop: 30}]}>
                    {/* button to view evacuation steps */}
                    <TouchableOpacity style={styles.bottomMenuBtn}
                                      onPress={()=>{handleEvacuationGuideBtnPress(disasterObj?.general?.disaster_type)}}>
                        <Text style={styles.bottomMenuBtnTxt}>
                            {t('disasterDetailsScreen.viewEvacuationSteps')}
                        </Text>
                    </TouchableOpacity>

                    {/* button to find useful locations */}
                    {/* <TouchableOpacity style={styles.bottomMenuBtn}>
                        <Text style={styles.bottomMenuBtnTxt}>
                            {t('disasterDetailsScreen.findUsefulLocations')}
                        </Text>
                    </TouchableOpacity> */}

                    {/* button to create report */}
                    <TouchableOpacity style={styles.bottomMenuBtn}>
                        <Text style={styles.bottomMenuBtnTxt}>
                            {t('disasterDetailsScreen.reportExperience')} {'(+50xp)'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        ):
        // loading overlay shown when isLoading is true
        (
            isLoading == true && (
                <LoadingOverlay />
            )
        )
    )
}

const styles = StyleSheet.create({
    // container of the screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    // scroll view containing the disaster information
    disasterInformationScrollView: {
        backgroundColor: 'white',
        width: '100%'
    },
    /* the content container for 
       disaster information scroll view */
    disasterInformationContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'white',
        rowGap: 20
    },
    // the disaster title text
    disasterTitleTxt: {
        fontSize: 20,
        color: '#2D3782',
        fontWeight: '600',
        textAlign: 'center'
    },
    // the disaster time text
    disasterTimeTxt: {
        fontSize: 17,
        color: '#2D3782',
        textAlign: 'center',
        fontWeight: '600'
    },
    // container of disaster details texts
    disasterDetailsContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 10
    },
    // the disaster details texts
    disasterDetailsTxt: {
        color: '#2D3782',
        textAlign: 'center',
        fontSize: 16
    },
    // disaster description text
    descriptionTxt: {
        fontSize: 16,
        color: '#2D3782',
        textAlign: 'center',
        fontWeight: '600'
    },
    // the menu at the bottom of the screen
    bottomMenu: {
        backgroundColor: 'white',
        width: '100%',
        borderWidth: 2,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        borderColor: '#2D3782',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 20
    },
    // buttons in the bottom menu
    bottomMenuBtn: {
        backgroundColor: '#2D3782',
        width: '90%',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderRadius: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    // text inside the buttons in the bottom menu
    bottomMenuBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    }
});
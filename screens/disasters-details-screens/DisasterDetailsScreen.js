import { Text, View, StyleSheet, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { roundTo2DP } from '../../utils/rounding';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../utils/text-formatting';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapDisasterLegend } from '../../components/MapDisasterLegend';
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native"; 
import * as mapStyle from '../../assets/map-style/style.json';

export function DisasterDetailsScreen({route}) {
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [disasterObj, setDisasterObj] = useState(null);
    const { t, i18n } = useTranslation();

    useEffect(()=>{
        console.log(route.params.disasterId);

        // fetch disaster details data
        const fetchDisasterDetails = async(disasterId) => {
            setIsLoading(true);

            const { data, error } = await supabase.schema('public')
                                                  .rpc('get_disaster_data_for_details_screen', {disaster_id_input: disasterId});
                                            
            if(error){
                showErrorToast('disasterDetailsScreen.failedToFetchDisasterDetails', 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                if(data){
                    setDisasterObj(data);
                    console.log(data);
                }
            }

            setIsLoading(false);
        };

        fetchDisasterDetails(route.params?.disasterId);

    }, [route?.params?.disasterId]);

    return( 
        disasterObj ? (
            <View style={styles.screenContainer}>
                {/* crowdsourced reports map placeholder */}
                {/* <View style={{width: '100%', height: 250, backgroundColor: 'plum'}}></View> */}

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
                                    [93, -12, 142, 10]} />


                    {/* marker showing the disaster */}
                    <Marker testID='disaster-marker-on-map'
                            lngLat={[disasterObj?.general?.longitude, disasterObj?.general?.latitude]}>
                        <MapDisasterLegend disasterType={disasterObj?.general?.disaster_type} />
                    </Marker>

                    {/* TODO: map crowdsourced report as markers 
                        (different appearance from disaster marker) */}
                </Map>

                <ScrollView contentContainerStyle={[styles.disasterInformationContainer, 
                                                    {paddingBottom: insets.bottom + 70,
                                                     paddingLeft: insets.left + 30,
                                                     paddingRight: insets.right + 30,
                                                     paddingTop: 20}]}
                            style={styles.disasterInformationScrollView}>
                    {/* title text */}
                    <Text style={styles.disasterTitleTxt}>
                        {
                          /* if no information about if it's contained in an area or not, 
                            just show disaster type */
                          disasterObj?.area?.contained_in_area == null ?       
                          i18n.exists(`disasterNames.${disasterObj?.general?.disaster_type}`) ?  
                          capitalizeFirstLetter(t(`disasterNames.${disasterObj?.general?.disaster_type}`)) : 
                          capitalizeFirstLetter(disasterObj?.general?.disaster_type) :
                          /* if there is information about if the disaster is contained in area,
                             show the title accordingly */
                           disasterObj?.area?.contained_in_area == true ? 
                           t('disasterDetailsScreen.titleWhenInAreaIsTrue', { disasterType: i18n.exists(`disasterNames.${disasterObj?.general?.disaster_type}`) ?  
                                                                                    capitalizeFirstLetter(t(`disasterNames.${disasterObj?.general?.disaster_type}`)) : 
                                                                                    capitalizeFirstLetter(disasterObj?.general?.disaster_type),
                                                                              cityOrRegency: disasterObj?.area?.city_or_regency,
                                                                              province: disasterObj?.area?.province}) :

                           t('disasterDetailsScreen.titleWhenInAreaIsFalse', { disasterType: i18n.exists(`disasterNames.${disasterObj?.general?.disaster_type}`) ?  
                                                                                        capitalizeFirstLetter(t(`disasterNames.${disasterObj?.general?.disaster_type}`)) : 
                                                                                        capitalizeFirstLetter(disasterObj?.general?.disaster_type),
                                                                                    distFromArea: roundTo2DP((disasterObj?.area?.dist_in_m_from_area)/1000),
                                                                                    cityOrRegency: disasterObj?.area?.city_or_regency,
                                                                                    province: disasterObj?.area?.province})
                        }
                    </Text>

                    {/* disaster time */}
                    <Text>
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
                            <Text>
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
                            <View>
                                {/* magnitude */}
                                {
                                    disasterObj?.magnitude && (
                                        <Text>
                                            {t('disasterDetailsScreen.magnitude')}: {disasterObj?.magnitude}
                                        </Text>
                                    )
                                }
                                
                                {/* earthquake depth */}
                                {
                                    disasterObj?.depthInKm && (
                                        <Text>
                                            {t('disasterDetailsScreen.depth')}: {disasterObj?.depthInKm} km
                                        </Text>
                                    )
                                }

                                {/* earthquake potential */}
                                {
                                    disasterObj?.potentialText && (
                                        <Text>
                                            {t('disasterDetailsScreen.potential')}: {disasterObj?.potentialText}
                                        </Text>
                                    )
                                }

                                {/* earthquake center description */}
                                {
                                    disasterObj?.earthquakeCenterText && (
                                        <Text>
                                            {t('disasterDetailsScreen.center')}: {disasterObj?.earthquakeCenterText}
                                        </Text>
                                    )
                                }

                                {/* structural failure status, following documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                {
                                    disasterObj?.structureFailureStatus !== null && (
                                        <Text>
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
                                        <Text>
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
                        disasterObj?.general.disaster_type == 'flood' && disasterObj?.floodDepthInCm !== null ?
                        (
                            <View>
                            {/* flood depth */}
                            <Text>
                                    {t('disasterDetailsScreen.depth')}: {disasterObj?.floodDepthInCm} cm
                                </Text>

                                {/* severity based on flood depth, following documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                <Text>
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
                        disasterObj?.general.disaster_type == 'haze' ?
                        (
                            <View>
                               {/* visibility, with number and status pairs according to documentation on:
                                   https://docs.petabencana.id/master-1/general/supported-hazards */}
                               {
                                    disasterObj?.visibility && (
                                        <Text>
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
                                        <Text>
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
                        disasterObj?.general.disaster_type == 'wind' && disasterObj?.impactStatus !== null ?
                        (
                            <View>
                                {/* the impact status, with number and status pairs according to documentation on:
                                    https://docs.petabencana.id/master-1/general/supported-hazards */}
                                <Text>
                                    {t('disasterDetailsScreen.impact')}:{' '}
                                    {disasterObj?.impactStatus == 0 ? t('disasterDetailsScreen.low'): 
                                     disasterObj?.impactStatus == 1 ? t('disasterDetailsScreen.medium'):
                                     disasterObj?.impactStatus == 2 && t('disasterDetailsScreen.high')}
                                </Text>
                            </View>
                        ):
                        disasterObj?.general.disaster_type == 'volcano' ?
                        (
                            <View>
                                {/* number of people in the village */}
                                {
                                    disasterObj?.numberOfPeopleInVillage !== null && (
                                        <Text>
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
                                        <Text>
                                            {t('disasterDetailsScreen.volcanicSignsObserved')}:
                                        </Text>

                                        {/* the list of signs observed */}
                                        {
                                            disasterObj?.signsStatusObserved.map((item, index) => (
                                                <Text key={index}>
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
                                    <Text>
                                        {t('disasterDetailsScreen.knowWhereToEvacuate')}: {' '}
                                        {disasterObj?.knowWhereToEvacuate == true ? t('shared.yes') : t('shared.no')}
                                    </Text>
                                )} 
                            </View>
                        ):
                        (
                            <Text>other</Text>
                        )
                    }
                </ScrollView>
            </View>
        ):
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
        backgroundColor: 'white'
    },
    // the disaster title text
    disasterTitleTxt: {
        fontSize: 20,
        color: '#2D3782',
        fontWeight: '600',
        textAlign: 'center'
    }
});

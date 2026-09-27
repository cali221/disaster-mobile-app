import { Text, 
         View, 
         StyleSheet, 
         Image, 
         ScrollView, 
         TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapDisasterLegend } from '../../components/MapDisasterLegend';
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native"; 
import { getDisasterTitle } from '../../utils/get-disaster-title';
import { DataAttributionSection } from '../../components/DataAttributionSection';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { BottomModalBase } from '../../components/modals-base/BottomModalBase';
import { SeverityIconAndLabel } from '../../components/SeverityIconAndLabel';
import { useIsFocused } from '@react-navigation/native';
import { MapAttribution } from '../../components/MapAttribution';

export function DisasterDetailsScreen({route, navigation}) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(true);
    const [disasterObj, setDisasterObj] = useState(null);
    const [disasterTitle, setDisasterTitle] = useState('');
    const [reportLocations, setReportLocations] = useState([]);
    const [mapStyle, setMapStyle] = useState(null);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.resolvedLanguage;
    const [shouldShowMap, setShouldShowMap] = useState(false);
    const [shouldShowUserReportsModal, setShouldShowUserReportsModal] = useState(false);
    const [reportsModalTitle, setReportsModalTitle] = useState('');
    const [reportsModalData, setReportsModalData] = useState([]);
    const newReportsSub = useRef(null);

    /* function to get report locations 
       (called both in useEffect and when new report 
       for the disaster is detected, so the 
       function is declared here) */
    const getReportLocations = async(disasterId) => {
        setIsLoading(true);

        const {data, error} = await supabase.schema('public')
                                            .rpc('get_unique_report_locations_and_report_count', 
                                                {disaster_id_input: disasterId});

        if(error){
            setIsLoading(false);

            showErrorToast(t('disasterDetailsScreen.failedToFetchReportLocations'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data){
                setIsLoading(false);
                return data;
            }
        }
    };

    const getReportsInAreaForDisasters = async(disasterId, locId) => {
        setIsLoading(true);

        const {data, error} = await supabase.schema('disasters_related_data')
                                            .from('user_reports')
                                            .select()
                                            .eq('disaster_id', disasterId)
                                            .eq('location_id', locId)
                                            .order('timestamp', { ascending: false });
        if(error){
            setIsLoading(false);

            showErrorToast(t('disasterDetailsScreen.failedToFetchReportsInTheArea'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data){
                setIsLoading(false);
                return data;
            }
        }
    };

    const handleReportMarkerPress = async(adm3, cityOrRegency, province, locId) => {
        // fetch the reports from the area
        const reportsData = await getReportsInAreaForDisasters(route?.params?.disasterId, locId);

        setReportsModalData(reportsData);

        // hide map, because it makes scroll view on modal act unexpectedly
        setShouldShowMap(false);

        // set the reports modal title
        setReportsModalTitle(t('disasterDetailsScreen.reportsModalTitle', 
                      {adm3: adm3, 
                       cityOrRegency: cityOrRegency, 
                       province: province}));

        // show reports modal
        setShouldShowUserReportsModal(true);
    };

    const hideReportsModal = () => {
        /* show the map again, since it was closed to fix 
           the unexpected scroll view behavior on the modal */
        setShouldShowMap(true);

        // hide the modal
        setShouldShowUserReportsModal(false);
    };

    // if language is changed, get the disaster title again 
    useEffect(()=>{
        if(disasterObj){
            setDisasterTitle(getDisasterTitle(disasterObj?.area?.contained_in_area,
                                              disasterObj?.area?.city_or_regency,
                                              disasterObj?.area?.province,
                                              disasterObj?.area?.dist_in_m_from_area,
                                              disasterObj?.general?.disaster_type,
                                              t,
                                              i18n));
        }
    }, [currentLang, disasterObj]);

    // function to handle 'View evacuation steps' button press
    const handleEvacuationGuideBtnPress = (disasterType) => {
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
        // function to subscribe to new disasters
        const subscribeToNewReports = (disasterId) => {
            // listen to new report inserts for the disaster
            const changes = supabase
                            .channel('user-reports-table-db-changes')
                            .on(
                            'postgres_changes',
                            {
                                event: 'INSERT',
                                schema: 'disasters_related_data',
                                table: 'user_reports',
                                filter: `disaster_id=eq.${disasterId}`
                            },
                            async(payload) => {
                                getReportLocations(route?.params?.disasterId).then(
                                    (data)=>{
                                        setReportLocations(data);
                                    }
                                );
                            }).subscribe();

            return changes;
        }; 

        // fetch disaster details data and set the disaster title
        const fetchDisasterDetails = async(disasterId) => {
            setIsLoading(true);

            const { data, error } = await supabase.schema('public')
                                                  .rpc('get_disaster_data_for_details_screen', 
                                                       {disaster_id_input: disasterId});
                                                
            if(error){
                setIsLoading(false);
                showErrorToast(t('disasterDetailsScreen.failedToGetDisasterData'), 
                               `${error.message ?? JSON.stringify(error)}`);

                return;
            }
            else{
                if(data){
                    setDisasterObj(data);
                    setDisasterTitle(getDisasterTitle(data?.area?.contained_in_area,
                                                      data?.area?.city_or_regency,
                                                      data?.area?.province,
                                                      data?.area?.dist_in_m_from_area,
                                                      data?.general?.disaster_type,
                                                      t,
                                                      i18n));
                    setIsLoading(false);
                }
            }
        };

        if(isFocused == true){
            /* fetch disaster details, get existing report locations 
               and subscribe to new reports for the disaster */
            fetchDisasterDetails(route?.params?.disasterId);
            getReportLocations(route?.params?.disasterId).then((data)=>{setReportLocations(data)});

            if(newReportsSub == null){
                newReportsSub.current = subscribeToNewReports(route?.params?.disasterId);
            }
        }

        return () => {
            if(newReportsSub.current){
                newReportsSub.current.unsubscribe();
                newReportsSub.current = null;
            }
        };
    }, [route?.params?.disasterId, isFocused]);

    return( 
        disasterObj ? (
            <View style={styles.screenContainer}>
                {/* button to hide/show map */}
                <TouchableOpacity onPress={()=>{setShouldShowMap(!shouldShowMap)}}
                                  style={styles.toggleShowMapBtn}
                                  accessibilityRole='button'>
                    {
                        <View style={styles.toggleShowMapBtnContentContainer}>
                            <Text style={styles.hideOrShowMapTxt}>
                                {shouldShowMap == true ? t('homeScreen.hideMap'):t('homeScreen.showMap')}
                            </Text>
        
                            {
                            shouldShowMap == true ? 
                            (
                                <ChevronUp color={'white'} size={30} />
                            ):
                            (
                                <ChevronDown color={'white'} size={30} />
                            )
                            }
                    </View>
                    }
                </TouchableOpacity>

                {/* crowdsourced report map, showing disaster location and 
                    locations where reports are available, markers of report 
                    location can be pressed to show reports in that location */}
                {
                    shouldShowMap == true && (
                        <View style={styles.mapAndTextsContainerr}>
                            {/* map placeholder */}
                            {/* <View style={{width: '100%', height: 200, backgroundColor: 'plum'}}></View> */}
                            
                           <Map style={styles.map} 
                                    mapStyle='https://tiles.openfreemap.org/styles/liberty'
                                    compassPosition={{top: 20, left: 20}}
                                    onStartShouldSetResponder={()=>{return true}}>
                                <Camera maxZoom={23} 
                                            zoom={10} 
                                            bounds={(disasterObj?.general?.latitude && 
                                                    disasterObj?.general?.longitude) ? 
                                                    [(disasterObj?.general?.longitude - 5), 
                                                    (disasterObj?.general?.latitude - 5), 
                                                    (disasterObj?.general?.longitude + 5), 
                                                    (disasterObj?.general?.latitude + 5)] : 
                                                    [93, -12, 142, 10]}/>

                                {reportLocations?.map((item, index) => (
                                    <Marker key={index}
                                            lngLat={[item?.center_lon, item?.center_lat]}
                                            onPress={()=>{handleReportMarkerPress(item?.adm3, 
                                                                                item?.city_or_regency, 
                                                                                item?.province, 
                                                                                item?.ogc_fid)}}>
                                        <View style={styles.reportLocMarker}>
                                            <Text style={styles.reportCountTxt}>
                                                {item?.report_count}
                                            </Text>
                                        </View>
                                    </Marker>
                                ))}

                                <Marker testID='disaster-marker-on-map'
                                        lngLat={[disasterObj?.general?.longitude, 
                                                disasterObj?.general?.latitude]}>
                                    <MapDisasterLegend disasterType={disasterObj?.general?.disaster_type} />
                                </Marker>
                            </Map>  
            
                            {/* attribution text just in case it's needed */}
                            <MapAttribution />
                
                            <View style={styles.mapAndExplanationContainer}>
                                {/* explanation text about the disaster map */}
                                <Text style={styles.mapExplanationTxt}>
                                    {t('disasterDetailsScreen.mapMarkingExplanation')}
                                </Text>
                            </View>
                        </View>  
                    )
                }

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
                                   style={styles.disasterImg}
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

                    <View style={styles.disasterDetailsSection}>
                        <Text style={styles.sectionsHeadingTxt}>
                            {t('disasterDetailsScreen.disasterDetails')}
                        </Text>

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
                                        disasterObj?.magnitude !== null && (
                                            <Text style={styles.disasterDetailsTxt}>
                                                {t('disasterDetailsScreen.magnitude')}: {disasterObj?.magnitude}
                                            </Text>
                                        )
                                    }
                                    
                                    {/* earthquake depth */}
                                    {
                                        disasterObj?.depthInKm !== null && (
                                            <Text style={styles.disasterDetailsTxt}>
                                                {t('disasterDetailsScreen.depth')}: {disasterObj?.depthInKm} km
                                            </Text>
                                        )
                                    }

                                    {/* earthquake potential */}
                                    {
                                        disasterObj?.potentialText !== null && (
                                            <Text style={styles.disasterDetailsTxt}>
                                                {t('disasterDetailsScreen.potential')}: {disasterObj?.potentialText}
                                            </Text>
                                        )
                                    }

                                    {/* earthquake center description */}
                                    {
                                        disasterObj?.earthquakeCenterText !== null && (
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
                                        disasterObj?.visibility !== null && (
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
                                        disasterObj?.airQualityStatus !== null && (
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
                           /* explanation text about details for the disaster type being unsupported */
                            <Text style={styles.unsupportedDetailsTxt}>
                                {t('disasterDetailsScreen.detailsUnsupportedForDisasterType')}
                            </Text>
                        )
                    }
                    </View>

                    {/* data attribution */}
                    <View style={styles.dataAttributionSection}>
                        {/* disaster data attribution */}
                        <View style={styles.dataAtrributionHeadingAndTextContainer}>
                            <Text style={styles.sectionsHeadingTxt}>
                                {t('disasterDetailsScreen.disasterDataSource')}
                            </Text>

                            <DataAttributionSection attributionTxt={currentLang == 'id' ? 
                                                                    disasterObj?.attribution_idn : 
                                                                    disasterObj?.attribution_eng} />
                        </View>

                        {/* admin boundaries data attribution */}
                        {
                            (disasterObj?.area?.admin_boundaries_data_attribution && 
                             disasterObj?.area?.admin_boundaries_data_attribution_idn) && (
                                <View style={styles.dataAtrributionHeadingAndTextContainer}>
                                    <Text style={styles.sectionsHeadingTxt}> 
                                        {t('disasterDetailsScreen.adminBoundariesDataSource')}
                                    </Text>

                                    <Text style={styles.adminBoundariesDatUsageExplanationTxt}>
                                        {t('disasterDetailsScreen.adminBoundariesDataUsageExplanation')}
                                    </Text>

                                    <DataAttributionSection attributionTxt={currentLang == 'id' ? 
                                                                            disasterObj?.area?.admin_boundaries_data_attribution_idn : 
                                                                            disasterObj?.area?.admin_boundaries_data_attribution} />
                                </View>
                            )
                        }
                    </View>
                </ScrollView>

                {/* menu at screen's bottom */}
                <View style={[styles.bottomMenu, {paddingBottom: insets.bottom + 50,
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

                    {/* button to create report */}
                    <TouchableOpacity style={styles.bottomMenuBtn}
                                      onPress={()=>{console.log(disasterObj?.general?.id); navigation.navigate('Report Form', {disasterId: disasterObj?.general?.id})}}>
                        <Text style={styles.bottomMenuBtnTxt}>
                            {t('disasterDetailsScreen.reportExperience')} {'(+50xp)'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* loading overlay shown when isLoading is true */}
                {
                    isLoading == true && (
                        <LoadingOverlay />
                    )
                }

                {/* modal for showing reports around a location, 
                    shown when a report marker on the map is pressed */}
                {shouldShowUserReportsModal == true && (
                    <BottomModalBase modalTitle={reportsModalTitle} 
                                     closeFunc={()=>{hideReportsModal()}}
                                     minHeight={350}>
                        {/* data attribution for the title shown on the title of the modal */}
                        <DataAttributionSection attributionTxt={t('disasterDetailsScreen.reportsLocationTitleDataAttribution')} />

                        {reportsModalData.map((item, index) => (
                            <View key={index} style={styles.reportItemContainer}>
                                {/* severity icon and label */}
                                <SeverityIconAndLabel iconSize={50} 
                                                      iconFillColor={'#9ec110'}
                                                      iconStrokeColor={'#2D3782'}
                                                      severityValue={item?.severity_status_number} />

                                <View style={styles.reportItemTextsContainer}>
                                    {/* description */}
                                    <Text style={[styles.reportItemDescText, 
                                                 {fontStyle: item?.description ? 
                                                  'normal' : 
                                                  'italic'}]}>
                                        {item?.description ? 
                                         item.description : 
                                         t('disasterDetailsScreen.noDescription')}
                                    </Text>

                                    {/* time the report was created */}
                                    <Text style={styles.reportItemTimeText}>
                                        {item?.timestamp ? 
                                         new Date(item?.timestamp).toLocaleString('id', {timeZoneName: 'short'}) : 
                                         t('disasterDetails.noTimestamp')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </BottomModalBase>
                )}
            </View>
        ):
        // loading overlay shown when disasterObj is not available
        (
            <LoadingOverlay />
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
        rowGap: 10,
        backgroundColor: '#2D3782',
        alignItems: 'flex-start',
        borderRadius: 20,
        width: '100%',
        padding: 20
    },
    /* container of the disaster details section 
       with the section heading and details */
    disasterDetailsSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
        backgroundColor: 'white'
    },
    // the disaster details texts
    disasterDetailsTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
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
        fontSize: 16,
        textAlign: 'center'
    },
    // disaster image
    disasterImg: {
        width: '100%', 
        aspectRatio: 1,
        borderRadius: 20
    },
    // section heading texts
    sectionsHeadingTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // container of the section for data attribution
    dataAttributionSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20
    },
    // container of each data attribution text and its heading
    dataAtrributionHeadingAndTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    /* explanation text under the heading for 
       the admin boundaries data attribution */
    adminBoundariesDatUsageExplanationTxt: {
        color: '#2D3782',
        fontSize: 16
    },
    /* explanation text about unsupported disaster 
       details for certain types of disasters */
    unsupportedDetailsTxt: {
        color: '#2D3782',
        fontSize: 16
    },
    // button to show/hide map
    toggleShowMapBtn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 15,
        width: '100%',
        backgroundColor: '#AB5C82',
        height: 30,
        elevation: 5
    },
    /* content container for text and icon 
       inside button to show/hide map */
    toggleShowMapBtnContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    // text inside button to show/hide map
    hideOrShowMapTxt: {
        fontSize: 17,
        color: 'white',
        fontWeight: '600'
    },
    // explanation text about map markings
    mapMarkingExplanationTxt: {
        color: '#2D3782',
        textAlign: 'center',
        fontSize: 17
    },
    // container of map and explanation text
    mapAndExplanationContainer: {
      width: '100%',
      paddingVertical: 10,
      paddingHorizontal: 15,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      elevation: 2,
      borderColor: 'grey',
      borderWidth: 2,
      backgroundColor: 'white'
    },
    // marker for locations with report(s)
    reportLocMarker: {
        width: 30, 
        height: 30, 
        backgroundColor: '#2d3782e8', 
        borderRadius: 15, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    // report count text inside marker
    reportCountTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // container of a report item
    reportItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 35,
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#2D3782'
    },
    /* container of texts (time and description) 
       of each report */
    reportItemTextsContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    // description text of the report
    reportItemDescText: {
        fontSize: 16,
        color: '#2D3782',
        fontWeight: '600'
    },
    // text showing the time the report was created
    reportItemTimeText: {
        color: '#2D3782',
        fontSize: 16
    },
    // the map showing the disaster and user report locations
    map: {
        width: '100%',
        height: 200
    },
    mapExplanationTxt: {
        fontSize: 16,
        textAlign: 'center',
        color: '#2D3782'
    }
});
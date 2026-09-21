import { Text, 
         StyleSheet, 
         View, 
         TouchableOpacity, 
         Switch, 
         Linking, 
         RefreshControl } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { getUserCurrentLocation } from '../../utils/users-utilities';
import { showErrorToast, showInfoToast } from '../../utils/show-toast';
import { ScrollView } from 'react-native-gesture-handler';
import { ChevronDown} from 'lucide-react-native';
import { LocationSearchAndPicker } from '../../components/modals/LocationSearchAndPickerModal';
//import { Map, Camera, Marker } from "@maplibre/maplibre-react-native"; 
import * as mapStyle from '../../assets/map-style/style.json';

export function UsefulLocationScreen() {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [placesData, setPlacesData] = useState([]);
    const [pickedCategory, setPickedCategory] = useState({type: 'amenity', place: 'hospital'});
    const [shouldShowLocPickerModal, setShouldShowLocPickerModal] = useState(false);
    const [pickedCoords, setPickedCoords] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isUsingCurrentLoc, setIsUsingCurrentLoc] = useState(true);
    const mapCamRef = useRef(null);
 
    /* function for handling picking a location from 
       the location picker modal */
    const handleLocationPickFromPicker = (locObj) => {
        setPickedCoords({latitude: locObj?.center_lat, 
                         longitude: locObj.center_lon, 
                         adm3_name: locObj.adm3_name,
                         adm2_name: locObj.adm2_name});

        setIsUsingCurrentLoc(false);
    };

    // function for getting the results from the Overpass API instance
    const getPlacesAroundCoordinates = async(type, place, radius, lat, lon) => {
        setIsLoading(true);
        
        try{
            // fetch the data
            const res = await fetch('https://maps.mail.ru/osm/tools/overpass/api/interpreter', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body:`[out:json];node["${type}"="${place}"](around:${radius},${lat},${lon});out center;`
            });

            if(res?.status !== 200){
                throw new Error(res?.statusText);
            }  
            else{
                // convert it to JSON
                const places = await res.json();

                // update the data state
                console.log(places);
                setPlacesData(places?.elements);
            }
        }
        catch(error){
            setPlacesData([]);
            showErrorToast(t('usefulLocScreen.failedToFetchPlacesData'), 
                            `${error.message ?? JSON.stringify(error)}`);
        };
        setIsLoading(false);
    };

    // handle pull to refresh (re-fetch places data)
    const onRefresh = useCallback(async () => {
        if(pickedCategory && pickedCoords){
            setRefreshing(true);

            getPlacesAroundCoordinates(pickedCategory?.type, 
                                       pickedCategory?.place, 
                                       7000, 
                                       pickedCoords?.latitude, 
                                       pickedCoords?.longitude);
            
            setRefreshing(false);
        }
    }, [pickedCategory, pickedCoords]);

    /* handle using current location */
    useEffect(() => {
        const setToCurrentLocation = async () => {
            try{
                // get the user's location
                const location = await getUserCurrentLocation();

                // if successful, update the picked coordinates state
                if(location){
                    setPickedCoords({latitude: location?.coords?.latitude, 
                                     longitude: location?.coords?.longitude,
                                     adm3_name: null,
                                     adm2_name: null});

                    setIsUsingCurrentLoc(true);
                }
                else{
                    throw new Error(t('usefulLocScreen.currentLocNotFound'));
                }
            }
            catch(error){
                setPickedCoords(null);
                setIsUsingCurrentLoc(false);
                setIsLoading(false);

                if(error.message == 'No permission to access location'){
                    showInfoToast(t('permissions.permissionNeeded'), 
                                    t('permissions.permissionNeededToGetLocation'));
                }
                else{
                    showErrorToast(t('usefulLocScreen.failedToUseCurrentCoords'), 
                                     `${error.message ?? JSON.stringify(error)}`);
                }
            };
        };

        /* re-obtain the user's coordinates and make it the 
           picked coordinate if isUsingCurrentLoc is true 
           (the switch is toggled so that the current location is used) */
        if(isUsingCurrentLoc == true){
            setToCurrentLocation();
        }
    }, [isUsingCurrentLoc])

    // handle updating search results
    useEffect(()=>{
        if(pickedCoords && pickedCategory){
            console.log('useffect pickeddCategroy, pickedcoords');
            getPlacesAroundCoordinates(pickedCategory?.type, 
                                       pickedCategory?.place, 
                                       7000, 
                                       pickedCoords?.latitude, 
                                       pickedCoords?.longitude);
        }                          
    }, [pickedCategory, pickedCoords]);

    return(
        <ScrollView contentContainerStyle={styles.screenContainer}
                    refreshControl={ <RefreshControl refreshing={refreshing} 
                                                     onRefresh={onRefresh}
                                                     colors={['#2D3782']}
                                                     progressBackgroundColor='#9ec110' />}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}>              
            {/* map placeholder */}
            {/* <View style={{width: '100%', height: 180, backgroundColor: 'plum'}}></View> */}

            {/* map showing the places */}
            {/* <Map mapStyle={mapStyle}
                 compassPosition={{top: 20, left: 20}}
                 onStartShouldSetResponder={()=>{return true}}
                 style={{width: '100%', height: 200}}>

                <Camera maxZoom={23} 
                        ref={mapCamRef}
                        bounds={(pickedCoords?.latitude && 
                                 pickedCoords?.longitude) ? 
                                 [(pickedCoords?.longitude - 1), 
                                  (pickedCoords?.latitude - 1), 
                                  (pickedCoords?.longitude + 1), 
                                  (pickedCoords?.latitude + 1)] : 
                                 [93, -12, 142, 10]} />
                {
                    (pickedCoords?.latitude && pickedCoords?.longitude) && (
                        <Marker testID='picked-loc-marker-on-map' 
                                lngLat={[pickedCoords.longitude, pickedCoords.latitude]}>
                            <View style={styles.pickedLocMarker}>
                                <Text style={styles.pickedLocTxtOnMarker}>
                                    {t('usefulLocScreen.usedLoc')}
                                </Text>
                            </View>
                        </Marker>
                    )
                }

                {
                    placesData?.map((item, index)=>(
                        <Marker key={index} 
                                testID='place-marker-on-map'
                                lngLat={[item.lon, item.lat]}
                                style={{backgroundColor: 'transparent', overflow: 'visible'}}>
                            <View style={styles.placeMarker}>
                                <Text style={styles.placeNamxTxtOnMarker}>
                                    {item?.tags?.name ? item?.tags?.name : t('usefulLocScreen.unnamed')}
                                </Text>
                            </View>
                        </Marker>
                    ))
                }
            </Map> */}

            <View style={styles.contentBelowMapContainer}>
                {
                    placesData.length > 0 && (
                        <Text style={styles.dataAttributionTxt}>
                            {t('usefulLocScreen.attributionSentenceStart')}
                            {' '}
                            <Text onPress={() => {Linking.openURL('https://openstreetmap.org/copyright')}}
                                  accessibilityRole='link'
                                  style={styles.osmLinkTxt}>
                                OpenStreetMap
                            </Text>
                        </Text>
                    )
                }

                {/* section containing the category buttons */}
                <ScrollView horizontal={true} 
                            style={styles.categoryBtnsScrollView} 
                            contentContainerStyle={styles.categoryBtnsContainer}>
                    {/* button for picking "Hospitals" category */}
                    <TouchableOpacity style={[styles.categoryBtn, 
                                              pickedCategory.place == 'hospital' ? 
                                              styles.pickedCategoryBtnColor : 
                                              styles.unpickedCategoryBtnColor]}
                                      onPress={()=>{setPickedCategory({type: 'amenity', place: 'hospital'})}}>
                        <Text style={[styles.categoryBtnTxt, 
                                      pickedCategory.place == 'hospital' ? 
                                      styles.pickedCategoryBtnTxtColor : 
                                      styles.unpickedCategoryBtnTxtColor]}>
                            {t('usefulLocScreen.hospitals')}
                        </Text>
                    </TouchableOpacity>

                    {/* button for picking "Peaks" category */}
                    <TouchableOpacity style={[styles.categoryBtn, 
                                              pickedCategory.place == 'peak' ? 
                                              styles.pickedCategoryBtnColor : 
                                              styles.unpickedCategoryBtnColor]}
                                      onPress={()=>{setPickedCategory({type: 'natural', place: 'peak'})}}>
                        <Text style={[styles.categoryBtnTxt, 
                                      pickedCategory.place == 'peak' ? 
                                      styles.pickedCategoryBtnTxtColor : 
                                      styles.unpickedCategoryBtnTxtColor]}>
                            {t('usefulLocScreen.peaks')}
                        </Text>
                    </TouchableOpacity>

                    {/* button for picking "Assembly Points" category */}
                    <TouchableOpacity style={[styles.categoryBtn, 
                                              pickedCategory.place == 'assembly_point' ? 
                                              styles.pickedCategoryBtnColor : 
                                              styles.unpickedCategoryBtnColor]}
                                      onPress={()=>{setPickedCategory({type: 'emergency', place: 'assembly_point'})}}>
                        <Text style={[styles.categoryBtnTxt, 
                                      pickedCategory.place == 'assembly_point' ? 
                                      styles.pickedCategoryBtnTxtColor : 
                                      styles.unpickedCategoryBtnTxtColor]}>
                            {t('usefulLocScreen.assemblyPoints')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* section for picking location to view places around */}
                <View style={styles.locationPickingSection}>
                    {/* switch for using current's coordinates 
                        and the explanation text */}
                    <View style={styles.useCurrentLocToggleContainer}>
                        <Text style={styles.usingCurrentLocStatusTxt}>
                            {
                                isUsingCurrentLoc == true ? 
                                t('usefulLocScreen.usingCurrentLoc'):
                                t('usefulLocScreen.useCurrentLoc')
                            }
                        </Text>

                        {/* switch for using current coordinates,
                            can't be switch off but can be switched on */}
                        <Switch trackColor={{false: '#767577', true: '#9ec110'}}
                                thumbColor={isUsingCurrentLoc == true ? '#809d0d' : '#f4f3f4'}
                                onValueChange={()=>{setIsUsingCurrentLoc(!isUsingCurrentLoc)}}
                                value={isUsingCurrentLoc}
                                disabled={isUsingCurrentLoc == false ? false : true} />
                    </View>

                    {/* location picker, can be pressed to view picker modal */}
                    <View style={styles.locationSearchContainer}>
                        {/* location picker, shows picker modal when pressed */}
                        <TouchableOpacity style={styles.locationPickerBtn}
                                          onPress={()=>{setShouldShowLocPickerModal(true)}}>
                            {/* text inside the location picker button, 
                                if a location was picked, show the area's name,
                                otherwise show text saying 'Pick another location'  */}
                            <Text style={styles.locationPickerTxt}>
                                {
                                    (pickedCoords?.adm3_name && pickedCoords.adm2_name) ?
                                    `${pickedCoords?.adm3_name}, ${pickedCoords.adm2_name}` : 
                                    t('usefulLocScreen.pickAnotherLoc')
                                }
                            </Text>

                            {/* 'dropdown' icon */}
                            <ChevronDown color={'#2D3782'} size={30} />
                        </TouchableOpacity>       
                    </View>
                </View>

                {/* list of the places around the picked coordinates */}
                <ScrollView style={styles.placesListScrollView} 
                            contentContainerStyle={[styles.placeListContainer, {paddingBottom: insets.bottom + 50}]}>
                    {
                        placesData.length > 0 ?
                        (
                            placesData.map((item, index) => (
                                /* when a list item is pressed, move the map's camera to 
                                   the marker representing the item that was just pressed */
                                <TouchableOpacity key={index} 
                                                  style={styles.placeItemContainer} 
                                                  onPress={()=>{
                                                    mapCamRef?.current?.easeTo({ center: [item.lon, item.lat], duration: 200});
                                                  }}>
                                    {/* the place's name */}
                                    {
                                        item.tags?.name ? 
                                        (
                                            <Text style={styles.placeNameTxt}>
                                                {item.tags.name}
                                            </Text>
                                        ):
                                        (
                                            <Text style={styles.placeNameTxt}>
                                                {t('usefulLocScreen.unnamed')}
                                            </Text>
                                        )
                                    }

                                    {/* the place's street */}
                                    {
                                        item.tags['addr:street'] && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.street')}: {item.tags['addr:street']}
                                            </Text>
                                        )
                                    }

                                    {/* the place's city */}
                                    {
                                        item.tags['addr:city'] && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.city')}: {item.tags['addr:city']}
                                            </Text>
                                        )
                                    }

                                    {/* the place's postcode */}
                                    {
                                        item.tags['addr:postcode'] && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.postcode')}: {item.tags['addr:postcode']}
                                            </Text>
                                        )
                                    }

                                    {/* the place's house number */}
                                    {
                                        item.tags['addr:housenumber'] && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.houseNumber')}: {item.tags['addr:housenumber']}
                                            </Text>
                                        )
                                    }

                                    {/* the place's elevation */}
                                    {
                                        item.tags?.ele && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.elevation')}: {item.tags.ele} {t('usefulLocScreen.mAboveSea')}
                                            </Text>
                                        )
                                    }

                                    {/* the place's description */}
                                    {
                                        item.tags?.description && (
                                            <Text style={styles.placeDetailsTxt}>
                                                {t('usefulLocScreen.description')}: {item.tags.description }
                                            </Text>
                                        )
                                    }
                                </TouchableOpacity>
                            ))
                        ):
                        // if places data is empty, show text saying there is no search results
                        placesData.length == 0 && (
                            <Text style={styles.noResTxt}>
                                {t('shared.noSearchRes')}
                            </Text>
                        )
                    }
                </ScrollView>
            </View>

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
                                             handleLocationPressFunc={handleLocationPickFromPicker}
                                             modalHeight={'90%'} />
                )
            }
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    // container of content below the map
    contentBelowMapContainer: {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        backgroundColor: 'white'
    },
    /* container of the buttons for 
       picking the category of places 
       (i.e. hospitals/peaks/assembly points) */
    categoryBtnsContainer: {
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 30
    },
    // button color for picked category
    pickedCategoryBtnColor: {
        backgroundColor: '#AB5C82'
    },
    // button color for categories that aren't picked
    unpickedCategoryBtnColor: {
        backgroundColor: '#2D3782'
    },
    // the buttons for picking a category
    categoryBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // text inside buttons for picking a category
    categoryBtnTxt: {
        fontSize: 16,
        fontWeight: '600'
    },
    // color for text in the picked category button 
    pickedCategoryBtnTxtColor: {
        color: 'white'
    },
    // color for text in the unpicked category button 
    unpickedCategoryBtnTxtColor: {
        color: 'white'
    },
    /* horizontal scroll view for
       showing buttons for picking a category */
    categoryBtnsScrollView: {
       height: 100,
       flexGrow: 0,
       width: '100%'
    },
    /* vertical scroll view for 
       showing list of places */
    placesListScrollView: {
        flex: 1,
        width: '100%'
    },
    /* content container for the scroll view 
       containing the list of places */
    placeListContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
        justifyContent: 'center'
    },
    /* container of each place shown 
       in the list of plcaes */
    placeItemContainer: {
        backgroundColor: 'white',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 2,
        borderColor: '#2D3782',
        elevation: 2,
        borderRadius: 20
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
        columnGap: 20,
        width: '100%'
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
        marginTop: 10,
        backgroundColor: 'white'
    },
    /* container of switch for using current 
       coordinates and the explanation text */
    useCurrentLocToggleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 25,
        width: '100%',
        maxWidth: 350
    },
    /* location picking area, with both the 
       switch for using current coordinate 
       and the location picker button */
    locationPickingSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20
    },
    // text showing each place's name
    placeNameTxt: {
        fontSize: 18,
        color: '#2D3782',
        fontWeight: '600'
    },
    // text saying that no search result was found
    noResTxt: {
        fontSize: 16,
        color: '#2D3782'
    },
    /* texts showing details of the 
       place e.g. street, city */
    placeDetailsTxt: {
        fontSize: 16,
        color: '#2D3782'
    },
    /* explanation text beside the switch 
       for using current coordinate */
    usingCurrentLocStatusTxt: {
        fontSize: 16,
        color: '#2D3782',
        fontWeight: '600',
        flex: 1
    },
    /* text inside location picker button 
       (that causes location picker modal 
       to show up when pressed) */
    locationPickerTxt: {
        fontSize: 16,
        color: '#2D3782'
    },
    /* text inside markers showing
       the name of places around 
       the picked coordinate */
    placeNamxTxtOnMarker: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center'
    },
    /* text inside marker showing the 
       picked coordinate */
    pickedLocTxtOnMarker: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center'
    },
    // marker showing the used location/coordinates
    pickedLocMarker: {
        width: 70, 
        height: 70, 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35, 
        backgroundColor: '#2D3782',
        padding: 5
    },
    // marker for each place on the map
    placeMarker: {
        width: 80, 
        height: 80, 
        borderRadius: 40, 
        backgroundColor: '#48a42cc6', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 5,
        overflow: 'scroll'
    },
    // data attribution text
    dataAttributionTxt: {
        fontSize: 16,
        color: '#2D3782',
        marginTop: 5
    },
    // the text link to OpenStreetMap's copyright page
    osmLinkTxt: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: 'dodgerblue'
    }
});
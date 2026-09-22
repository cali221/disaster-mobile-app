import { Text, 
         StyleSheet, 
         View, 
         TouchableOpacity, 
         Switch, 
         Linking, 
         RefreshControl,
         ScrollView } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { getUserCurrentLocation } from '../../utils/users-utilities';
import { showErrorToast, showInfoToast } from '../../utils/show-toast';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { LocationSearchAndPicker } from '../../components/modals/LocationSearchAndPickerModal';
import { Map, Camera, Marker, OfflineManager } from "@maplibre/maplibre-react-native"; 
import * as Location from "expo-location";

export function UsefulLocationScreen() {
    const [shouldSearch, setShouldSearch] = useState(false);
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [placesData, setPlacesData] = useState([]);
    const [pickedCategory, setPickedCategory] = useState({type: 'amenity', place: 'hospital'});
    const [shouldShowLocPickerModal, setShouldShowLocPickerModal] = useState(false);
    const [pickedCoords, setPickedCoords] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isUsingCurrentLoc, setIsUsingCurrentLoc] = useState(true);
    const [currentLoc, setCurrentLoc] = useState(null);
    const [shouldShowMenu, setShouldShowMenu] = useState(false);
    const mapRef = useRef(null);
    const mapCamRef = useRef(null);
    const locationTrackingRef = useRef(null);
 
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
                setPlacesData(places?.elements);
            }
        }
        catch(error){
            setPlacesData([]);
            
            showErrorToast(t('usefulLocScreen.failedToFetchPlacesData'), 
                            `${error.message ?? JSON.stringify(error)}`);
        };

        // reset shouldSearch state
        setShouldSearch(false);

        // hide menu
        setShouldShowMenu(false);
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
            setIsLoading(true);

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

                    setCurrentLoc({latitude: location?.coords?.latitude, 
                                   longitude: location?.coords?.longitude});

                    if(!locationTrackingRef.current){
                        locationTrackingRef.current = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Highest,
                            timeInterval: 2000, // update every 2 seconds
                            distanceInterval: 1, // minium distance change of 1 meter 
                            },
                            (loc) => {
                                setCurrentLoc({latitude: loc?.coords?.latitude, 
                                               longitude: loc?.coords?.longitude});
                            }
                        );
                    }
                }
            }
            catch(error){
                setPickedCoords(null);
                setIsUsingCurrentLoc(false);
                setCurrentLoc(null);

                if(locationTrackingRef.current){
                   locationTrackingRef.current.remove();
                   locationTrackingRef.current = null;
                }

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

            setIsLoading(false);
        };

        /* re-obtain the user's coordinates and make it the 
           picked coordinate if isUsingCurrentLoc is true 
           (the switch is toggled so that the current location is used) */
        if(isUsingCurrentLoc == true){
            setToCurrentLocation();
        }

        return () => {
            if(locationTrackingRef?.current){
               locationTrackingRef.current.remove();
               locationTrackingRef.current = null;
            }
        }
    }, [isUsingCurrentLoc])

    // handle updating search results
    useEffect(()=>{
        if(pickedCoords !== null && pickedCategory !== null && shouldSearch == true){
            console.log('pickedCategory && pickedCoords && shouldSearch');

            getPlacesAroundCoordinates(pickedCategory?.type, 
                                       pickedCategory?.place, 
                                       7000, 
                                       pickedCoords?.latitude, 
                                       pickedCoords?.longitude);
            setShouldSearch(false);
        }                      
    }, [pickedCategory, pickedCoords, shouldSearch]);


    // create offline pack for map -> havent figured it out, dont know how it's used
    const createMapOfflinePack = async() => {
        console.log('createMapOfflinePack')
        try{
            const offlinePack = await OfflineManager.createPack(
                {
                    mapStyle: 'https://tiles.openfreemap.org/styles/liberty',
                    minZoom: 14,
                    maxZoom: 23,
                    bounds: [106.562326, -6.447648, 106.907076, -6.272255],
                    metadata: { name: "Tangerang Selatan Area" },
                },
                (offlineRegion, status) => console.log(offlineRegion, status),
                (offlineRegion, error) => console.log(offlineRegion, error)
            );

            if(offlinePack){
                offlinePack.resume();
            }
        }
        catch(error){
            alert(JSON.stringify(error.message))
        }
    };


    useEffect(()=>{
        // get map style on load
        //getStyle().then((style)=>{setMapStyle(style)});

        const getPacks = async() => {
            await OfflineManager.getPacks().then((data)=>{
                console.log(data);
            });
        }

        const deletePack = async(id) => {
            console.log('deleting packs')
            await OfflineManager.deletePack(id);
        }

        const invalidateCache = async() => {
            await OfflineManager.invalidateAmbientCache();
        }

        getPacks();
    }, []);

    // simulate moving current location
    //useEffect(() => {
        // const x = setTimeout(() => {
        //     if(currentLoc){
        //         setCurrentLoc({longitude: currentLoc?.longitude - 0.001, 
        //                        latitude: currentLoc?.latitude + 0.001});
        //     }
        // }, 1000);

        // if(currentLoc){
        //     mapCamRef?.current?.easeTo({ center: [currentLoc?.longitude, currentLoc?.latitude], duration: 200});
        // }

        //return () => clearTimeout(x);
    //}, [currentLoc]);

    return(
        <ScrollView contentContainerStyle={styles.screenContainer}
                    scrollEnabled={false}
                    nestedScrollEnabled={true}>    
            {/* map placeholder */}
            {/* <View style={{width: '100%', height: 180, backgroundColor: 'plum'}}></View> */}

            <TouchableOpacity style={styles.downloadForOfflineBtn} 
                              onPress={()=>{createMapOfflinePack()}}>
                <Text style={styles.downloadForOfflineBtnTxt}>
                    {t('usefulLocScreen.downloadLocationDataForOfflineUse')}
                </Text>
            </TouchableOpacity>

            {/* map showing the places */}
            <Map mapStyle={'https://tiles.openfreemap.org/styles/liberty'}
                    compassPosition={{top: 20, left: 20}}
                    onStartShouldSetResponder={()=>{return true}}
                    style={styles.map}
                    ref={mapRef}>
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

                {
                    (pickedCoords?.latitude && pickedCoords?.longitude) && (
                        <Marker testID='picked-loc-marker-on-map' 
                                lngLat={[pickedCoords?.longitude, pickedCoords?.latitude]}>
                            <View style={styles.pickedLocMarker}>
                                <Text style={styles.pickedLocTxtOnMarker}>
                                    {t('usefulLocScreen.usedLoc')}
                                </Text>
                            </View>
                        </Marker>
                    )
                }

                {
                    (currentLoc?.latitude && currentLoc?.longitude) && (
                        <Marker lngLat={[currentLoc?.longitude, currentLoc?.latitude]}>
                            <View style={styles.currentLocMarker}>
                                <Text style={styles.currentLocMarkerTxt}>
                                    {t('shared.you')}
                                </Text>
                            </View>
                        </Marker>
                    )
                }
            </Map>

            <View style={[styles.contentBelowMapContainer, {paddingBottom: insets.bottom}]}>
                <TouchableOpacity onPress={()=>{setShouldShowMenu(!shouldShowMenu)}}
                                  style={styles.hideShowMenuBtn}>
                    <Text style={styles.hideShowMenuBtnTxt}>
                        {
                            shouldShowMenu == true ?
                            t('usefulLocScreen.hideMenu'):
                            t('usefulLocScreen.showMenu')
                        }
                    </Text>

                    {
                        shouldShowMenu == true ? 
                        (
                            <ChevronUp color={'#2D3782'} size={30} />
                        ):
                        (
                           <ChevronDown color={'#2D3782'} size={30} />
                        )
                    }
                </TouchableOpacity>

                {
                    shouldShowMenu == true ? (
                        // the search menu
                        <View style={[styles.searchMenuContainer, {marginBottom: insets.bottom}]}>
                            <Text style={styles.pickCategoryTxt}>
                                {t('usefulLocScreen.pickACategory')}
                            </Text>

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
                            
                            {/* button to start search */}
                            <TouchableOpacity onPress={()=>{setShouldSearch(true)}} style={styles.searchBtn}>
                                <Text style={styles.searchBtnTxt}>
                                    {t('shared.search')}
                                </Text>
                            </TouchableOpacity> 
                        </View>
                    ):
                    (
                        <ScrollView style={styles.placesListScrollView} 
                                    contentContainerStyle={styles.placeListContainer}
                                    refreshControl={<RefreshControl refreshing={refreshing} 
                                                                    onRefresh={onRefresh}
                                                                    colors={['#2D3782']}
                                                                    progressBackgroundColor='#9ec110'/>}>
                            {/* coordinates text */}
                            <Text style={styles.latLongTxt}>
                                {t('usefulLocScreen.latitude')}: {currentLoc?.latitude ? currentLoc?.latitude : t('shared.unavailable')}
                                {' | '} 
                                {t('usefulLocScreen.longitude')}: {currentLoc?.longitude ? currentLoc?.longitude : t('shared.unavailable')}
                            </Text>

                            {/* data attribution text */}
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

                            {/* places list */}
                            {
                                placesData.length > 0 ?
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
                                )):
                                (
                                    // if there are no places to show, inform user using text
                                    <View style={styles.noPlacesContainer}>
                                        <Text style={styles.noPlacesToShowTxt}>
                                            {t('usefulLocScreen.noPlacesToShow')}
                                        </Text>
                                    </View>
                                )
                            }
                        </ScrollView>
                    )
                }
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
        justifyContent: 'flex-start',
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
        columnGap: 20
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
        borderRadius: 70,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
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
       width: '100%'
    },
    /* vertical scroll view for 
       showing list of places */
    placesListScrollView:{
        width: '100%', 
        backgroundColor: 'white'
    },
    /* content container for the scroll view 
       containing the list of places */
    placeListContainer: {
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%', 
        rowGap: 20, 
        padding: 20
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
        marginTop: 5,
        textAlign: 'center'
    },
    // the text link to OpenStreetMap's copyright page
    osmLinkTxt: {
        fontSize: 16,
        textDecorationLine: 'underline',
        color: 'dodgerblue'
    },
    // the map
    map: {
        width: '100%', 
        height: 230
    },
    // placeholder of map
    mapPlaceholder: {
        width: '100%',
        height: 230,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    // marker for user's current location (subscribed)
    currentLocMarker: {
        width: 50, 
        height: 50, 
        backgroundColor: '#AB5C82', 
        borderRadius: 25, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 2,
        borderWidth: 3,
        borderColor: '#2D3782'
    },
    // text inside user's current location marker
    currentLocMarkerTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // button to start search
    searchBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // text inside search button
    searchBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
    // button to show/hide the search menu
    hideShowMenuBtn: {
        backgroundColor: '#9ec110',
        width: '100%',
        paddingVertical: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        columnGap: 5,
        flexDirection: 'row'
    },
    // text inside button to show/hide search menu
    hideShowMenuBtnTxt: {
        color: '#2D3782',
        fontSize: 17,
        fontWeight: '600'
    },
    // text saying if there is no place to list
    noPlacesToShowTxt: {
        color: '#2D3782',
        fontSize: 17,
        textAlign: 'center'
    },
    // latitude and longitude text
    latLongTxt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
    /* container of the content for when 
       there is no places to show */
    noPlacesContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    // text saying 'Please pick a category'
    pickCategoryTxt: {
        fontSize: 17,
        color: '#2D3782'
    },
    // container of the search menu
    searchMenuContainer: {
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        paddingBottom: 30, 
        paddingHorizontal: 20, 
        borderBottomWidth: 3, 
        borderLeftWidth: 3, 
        borderRightWidth: 3, 
        borderColor: '#2D3782', 
        borderBottomLeftRadius: 30, 
        borderBottomRightRadius: 30, 
        paddingTop: 10,
        backgroundColor: 'white',
        rowGap: 10
    },
    downloadForOfflineBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 8,
        zIndex: 15,
        backgroundColor: '#2D3782',
        borderRadius: 30
    },
    downloadForOfflineBtnTxt: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600'
    }
});
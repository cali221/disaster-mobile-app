import { useEffect, useState } from 'react'
import { Text, 
         TouchableOpacity, 
         View, 
         TextInput, 
         StyleSheet, 
         ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { showErrorToast, showSuccessToast, showInfoToast } from '../../utils/show-toast';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { DataAttributionSection } from '../../components/DataAttributionSection';

export function WatchedAreasSettingsScreen({navigation, route}) {  
    const { t, i18n } = useTranslation();

    const { user } = useContext(AuthContext);

    // state handling when the loading spinner should be shown
    const [isLoading, setIsLoading] = useState(false);

    // state for search query for locations
    const [locSearchQuery, setLocSearchQuery] = useState('');

    // state for location search results
    const [locSearchResults, setLocSearchResults] = useState([]);

    // state for areas already watched
    const [watchedAreas, setWatchedAreas] = useState([]);

    // function for searching for a location
    const searchLoc = async(query) => {
        setIsLoading(true);

        const { data, error } = await supabase.schema('admin_boundaries')
                                              .from('cities_and_regencies')
                                              .select()
                                              .ilike('adm2_name', `%${query}%`);

        if(error){
            showErrorToast(t('shared.failedToFetchSearchRes'), `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data.length == 0){
                showInfoToast(t('shared.noSearchRes'), '')
            }
            // set search results using the results obtained
            setLocSearchResults(data);
        }

        setIsLoading(false);
    };

    // function for adding location to watchlist
    const addToWatchedAreas = async(selectedArea) => {
        setIsLoading(true);

        // insert area to table for user watched area
        const { error } = await supabase.schema('users')
                                        .from('users_watched_areas')
                                        .insert({user_id: user.id, 
                                                 watched_area_id: selectedArea.ogc_fid});
        if(error){
            if(error.code == 23505){
                showInfoToast(t('watchedAreasScreen.alreadyWatchingArea'), '')
            }
            else{
                showErrorToast(t('watchedAreasScreen.failedToAddToWatchlist') `${error.message ?? JSON.stringify(error)}`);
            }
        }
        else{
            // if successful, update state
            setWatchedAreas(watchedAreas => [...watchedAreas, {adm2_name: selectedArea.adm2_name, adm1_name: selectedArea.adm1_name}]);
            showSuccessToast(t('watchedAreasScreen.addedToWatchedAreas'), '')
        }
        setIsLoading(false);
    };

    // function to remove area from watchlist
    const removeWatchedArea = async(idOfAreaToRemove) => {
        setIsLoading(true);

        const { error } = await supabase.schema('users')
                                        .from('users_watched_areas')
                                        .delete()
                                        .eq('watched_area_id', idOfAreaToRemove);

        if(error){
            showErrorToast(t('watchedAreasScreen.failedToRemoveWatchedArea'), `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            // remove area from watched areas state
            const newWatchedAreasArr = watchedAreas.filter((area) => area.watched_area_id !== idOfAreaToRemove);
            setWatchedAreas(newWatchedAreasArr);

            showSuccessToast(t('watchedAreasScreen.areaRemoved'), '');
        }

        setIsLoading(false);
    };

    // on first load fetch user's watched areas and admin boundaries data attribution text
    useEffect(()=>{
        // function for getting areas on user's watchlist
        const getAreasWatched = async() => {
            if(user?.id){
                setIsLoading(true);

                const {data, error} = await supabase.schema('public')
                                                    .rpc('get_user_watched_areas',
                                                         {user_id_input: user.id})

                if(error){
                    showErrorToast(t('watchedAreasScreen.failedToFetchWatchedAreas'), `${error.message ?? JSON.stringify(error)}`);
                }
                else{
                    setWatchedAreas(data);
                }

                setIsLoading(false);
            }
        };
        
        getAreasWatched();
    }, [user?.id])
        
    return(
        <ScrollView style={styles.watchedAreasScreen} 
                    nestedScrollEnabled={true} 
                    contentContainerStyle={styles.watchedAreasScreenContentContainer}>

            <Text style={styles.searchExplanationTxt}>
                {t('watchedAreasScreen.searchExplanationTxt')}
            </Text>

            {/* area for location searches */}
            <View style={styles.searchArea}>
                {/* search input field*/}
                <TextInput onChangeText={setLocSearchQuery}
                           value={locSearchQuery}
                           style={styles.searchTextInput} /> 

                {/* search button */}
                <TouchableOpacity onPress={()=>{searchLoc(locSearchQuery)}}
                                  style={styles.searchBtn}
                                  accessibilityRole='button'
                                  accessibilityLabel={t('shared.search')}>
                    <Text style={styles.searchBtnTxt}>
                        {t('shared.search')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchResultsContainer}>
                {/* area for showing search results */}
                <Text style={styles.headingTxt}>
                    {t('shared.searchRes')}:
                </Text>

                {/* scroll view showing search results */}
                <ScrollView style={styles.dataScrollView} 
                            nestedScrollEnabled={true} 
                            contentContainerStyle={styles.dataScrollViewContentContainer}>
                    {locSearchResults.map((item, i) => (
                        <View key={i} style={styles.resultItemContainer}>
                            {/* area display name */}
                            <View style={styles.searchResTxtsContainer}>
                                <Text style={styles.adm2Txt}>
                                    {item.adm2_name}
                                </Text>

                                <Text style={styles.adm1Txt}>
                                    {item.adm1_name}
                                </Text>
                            </View>

                            {/* button to add the location to watchlist */}
                            <TouchableOpacity style={styles.watchAreaBtn}
                                              onPress={()=>{addToWatchedAreas(item)}}
                                              accessibilityRole='button'
                                              accessibilityLabel={t('watchedAreasScreen.watchAreaBtnTxt')}>
                                <Text style={styles.watchAreaBtnTxt}>
                                    {t('watchedAreasScreen.watchAreaBtnTxt')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.watchlistContainer}>
                {/* area for showing locations in user's watchlist */}
                <Text style={styles.headingTxt}>
                    {t('watchedAreasScreen.locsOnWatchlist')}:
                </Text>

                {/* scroll view showing the user's current watched areas */}
                <ScrollView style={styles.dataScrollView} 
                            nestedScrollEnabled={true}
                            contentContainerStyle={styles.dataScrollViewContentContainer}>
                    {user && watchedAreas.map((item, i) => (
                        <View key={i} style={styles.watchlistItemContainer}>
                            <View style={styles.watchedAreaTxt}>
                                <Text style={styles.adm2Txt}>
                                    {item.adm2_name}
                                </Text>

                                <Text style={styles.adm1Txt}>
                                    {item.adm1_name}
                                </Text>
                            </View> 

                            {/* button to remove area from watchlist */}
                            <TouchableOpacity style={styles.removeAreaBtn}
                                              accessibilityRole='button'
                                              accessibilityLabel={t('shared.remove')}
                                              accessibilityHint={t('watchedAreasScreen.accHintRemoveAreaBtn')}
                                              onPress={()=>{removeWatchedArea(item.watched_area_id)}}>
                                <Text style={styles.removeAreaBtnTxt}>
                                    {t('shared.remove')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
           
            {/* loading ovelay, shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }

            {/* data attribution */}
            <DataAttributionSection attributionTxt={t('watchedAreasScreen.dataAttrTxt')} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    // screen scrollview container
    watchedAreasScreenScrollView: {
      backgroundColor:'red',
      width: '100%'
    },
    watchedAreasScreenContentContainer:{
        paddingHorizontal: 30, 
        paddingTop: 30, 
        paddingBottom: 100, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'white',
        width: '100%',
        justifyContent: 'center',
        rowGap: 30
    },
    // explanation text about search
    searchExplanationTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // the text input field for searching for locations
    searchTextInput: {
        borderWidth: 1,
        borderColor: '#2D3782',
        borderRadius: 20,
        paddingHorizontal: 10,
        height: '100%',
        flex: 1,
        color: '#2D3782',
        fontSize: 16
    },
    // container of search form (text input + search button)
    searchArea: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20
    },
    // button for searching for locations
    searchBtn: {
        minWidth: 80,
        backgroundColor: '#2D3782',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        height: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    // text inside the search button
    searchBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
    // container of search results scroll view
    searchResultsContainer: {
        height: 250
    },
    // scroll view for showing data
    dataScrollView: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2
    },
    // content container of data scroll views
    dataScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
        paddingBottom: 80
    },
    // heading texts for sections on the screen
    headingTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782',
        marginBottom: 15
    },
    // container of each search result + button to add to watchlist
    resultItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3782',
        paddingVertical: 10
    },
    // container of the texts of each search result
    searchResTxtsContainer:{
        width: '50%',
        maxWidth: 350,
        display:'flex',
        flexDirection: 'column',
        rowGap: 10
    },
    // button to add location to watchlist
    watchAreaBtn: {
        backgroundColor: '#2D3782',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        height: 40
    },
    // text inside the watch area button
    watchAreaBtnTxt: {
        fontWeight: '600',
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    },
    // container of scroll view showing areas on user's watchlist
    watchlistContainer: {
        height: 250
    },
    // container of each item on user's watchlist
    watchlistItemContainer:{
        borderBottomWidth: 1,
        borderColor: '#2D3782',
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: 20
    },
    // container of text showing user's watched areas
    watchedAreaTxt: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
        width: '50%',
        maxWidth: 350,
    },
    // text showing admin 2 name 
    adm2Txt: {
        color: '#2D3782',
        fontSize: 16,
        fontWeight: '600'
    },
    // text showing admin 1 name
    adm1Txt: {
        color: '#2D3782',
        fontSize: 16
    },
    // button to remove location from watchlist
    removeAreaBtn: {
       backgroundColor: '#2D3782',
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       borderRadius: 20,
       paddingHorizontal: 20,
       paddingVertical: 10,
       height: 40
    },
    // text inside button to remove area from watchlist
    removeAreaBtnTxt: {
        fontWeight: '600',
        fontSize: 16,
        color: 'white',
        textAlign: 'center'
    }
})
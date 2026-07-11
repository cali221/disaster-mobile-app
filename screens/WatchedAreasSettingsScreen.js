import { useEffect, useState } from 'react'
import { Text, 
         TouchableOpacity, 
         View, 
         TextInput, 
         StyleSheet, 
         ScrollView, 
         ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'
import { useRoute } from '@react-navigation/native';

export function WatchedAreasSettingsScreen({navigation}) {
    const attrDefaultStr = `Indonesian subnational administrative boundaries data source: \
Badan Pusat Statistik (BPS - Statistics Indonesia). Contributed by: \
OCHA Field Information Services Section (FISS). \
Licensed under Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO) \
(https://creativecommons.org/licenses/by/3.0/igo/). \
The data used in this project is a subset of the data provided and \
organized and shown according the the project's needs.  \
Web page of data and resources: https://data.humdata.org/dataset/cod-ab-idn`;

    const route = useRoute();

    const [session, setSession] = useState(null);

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
        // show loading spinner
        setIsLoading(true);

        const { data, error } = await supabase.schema('admin_boundaries')
                                              .from('cities_and_regencies')
                                              .select()
                                              .ilike('adm2_name', `%${query}%`);

        if(error){
            alert(error.message);
        }
        else{
            // set search results using the results obtained
            setLocSearchResults(data);
        }

        // stop showing loading spinner
        setIsLoading(false);
    }

    // function for adding location to watchlist
    const addToWatchedAreas = async(selectedArea) => {
        // insert area to table for user watched area
        const { error } = await supabase.schema('users')
                                        .from('users_watched_areas')
                                        .insert({user_id: route.params.session.user.id, 
                                                 watched_area_id: selectedArea.ogc_fid});
        if(error){
            throw new Error(error.message);
        }
        else{
            // if successful, update state
            setWatchedAreas(watchedAreas => [...watchedAreas, `${selectedArea.adm2_name}, ${selectedArea.adm1_name}`]);
        }
    }

    // on first load fetch user's watched areas and admin boundaries data attribution text
    useEffect(()=>{
        const { authData } = supabase.auth.onAuthStateChange((event, session) => {
            if(!session?.user || event === 'SIGNED_OUT'){
                setSession(null);
                navigation.navigate('Sign In')
            }
            else if(session?.user){
                setSession(session);
            }
        });

        // function for getting areas on user's watchlist
        const getAreasWatched = async() => {
           const {data, error} = await supabase.schema('public')
                                               .rpc('get_user_watched_areas_as_diplay_names',
                                                    {user_id_input: route.params.session.user.id})

           if(error){
            alert(error);
           }
           else{
            const fetchedWatchedAreas = data.map(item => item.display_name);
            setWatchedAreas([...fetchedWatchedAreas]);
           }
        };
        
        getAreasWatched();
    }, [])
        
    return(
        <ScrollView style={styles.accountSettingsScreenScrollView} nestedScrollEnabled={true}>
            <View style={styles.accountSettingsScreenContentContainer}>
                <Text style={styles.attributionTxt}>
                    {attrDefaultStr}
                </Text>

                {/* area for ocation searches */}
                <View style={styles.searchArea}>
                    {/* search input field*/}
                    <TextInput onChangeText={setLocSearchQuery}
                            value={locSearchQuery}
                            style={styles.searchTextInput} /> 

                    {/* search button */}
                    <TouchableOpacity onPress={()=>{searchLoc(locSearchQuery)}}
                                    style={styles.searchBtn}>
                        <Text>
                            Search
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* area for showing search results */}
                <Text style={styles.headingTxt}>
                    Search Results:
                </Text>

                <View style={styles.searchResultsContainer}>
                    <ScrollView style={styles.searchResultsScrollView} nestedScrollEnabled={true}>
                        {locSearchResults.map((item, i) => (
                            <View key={i} style={styles.resultItemContainer}>
                                {/* area display name */}
                                <View style={styles.searchResTxtsContainer}>
                                    <Text>{item.adm2_name}</Text>
                                    <Text>{item.adm1_name}</Text>
                                </View>

                                {/* button to add the location to watchlist */}
                                <TouchableOpacity style={styles.watchAreaBtn}
                                                onPress={()=>{addToWatchedAreas(item)}}>
                                    <Text>
                                        Watch area
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* area for showing locations in user's watchlist */}
                <Text style={styles.headingTxt}>Locations on your watchlist:</Text>

                <View style={styles.watchlistContainer}>
                    <ScrollView style={styles.watchlistScrollView} nestedScrollEnabled={true}>
                        {route.params.session?.user && watchedAreas.map((item, i) => (
                            <View key={i} style={styles.watchlistItemContainer}>
                                <Text>{item}</Text> 
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
            {/* loading spinner, shown only when isLoading is true */}
            {
                isLoading == true && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color='pink' />
                    </View>
                )
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    // screen scrollview container
    accountSettingsScreenScrollView: {
      backgroundColor:'white',
      flex: 1,
      width: '100%'
    },
    accountSettingsScreenContentContainer:{
        padding: 30,
        height: '100%',
        marginBottom: '30%'
    },
    // the text input field for searching for locations
    searchTextInput: {
        borderWidth: 2,
        borderColor: 'black',
        width: '70%',
        maxWidth: 300,
        borderRadius: 20,
        paddingHorizontal: 10
    },
    // container of search form (text input + search button)
    searchArea: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    // button for searching for locations
    searchBtn: {
        width: 80,
        backgroundColor: 'pink',
        height: '50',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
    },
    // container of search results scroll view
    searchResultsContainer: {
        height: 250
    },
    // scroll view showing search results
    searchResultsScrollView: {
        borderWidth: 2,
        borderColor: 'black',
        width: '100%',
        padding: 20,
        borderRadius: 20
    },
    // heading texts for sections on the screen
    headingTxt: {
        marginVertical: 12
    },
    // container of each search result + button to add to watchlist
    resultItemContainer: {
        width: '100%',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
        paddingBottom: 10,
        borderBottomWidth: 1
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
        backgroundColor: 'pink',
        height: 50,
        width: 90,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    },
    // overlay behind loading spinner
    loadingOverlay:{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: '#0000008f',
        zIndex: 1,
    },
    /// container of scroll view showing areas on user's watchlist
    watchlistContainer: {
        height: 250
    },
    // scroll view showing the locations on user's watchlist
    watchlistScrollView: {
        padding: 15,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 20,
    },
    // container of each item on user's watchlist
    watchlistItemContainer:{
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: 20,
        paddingBottom: 10,
    },
    attributionTxt: {
        marginBottom: 12
    }
})
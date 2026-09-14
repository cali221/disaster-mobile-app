import { Text, View, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { CenterModalBase } from '../modals-base/CenterModalBase';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../LoadingOverlay';
import { showInfoToast, showErrorToast} from '../../utils/show-toast';

export function LocationSearchAndPicker(props) {
    const { t, i18n } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);

    // state for location search query
    const [searchQuery, setSearchQuery] = useState('');

    // state for location search results
    const [locSearchResults, setLocSearchResults] = useState([]);

    /* set the picked location and location 
       text when a location is picked */
    const handleLocationPick = (locObj) => {
        props.handleLocationPressFunc(locObj);
        props.hideBadgeModalFunc();
    };

    // function for searching for a location
    const searchLoc = async(query) => {
        console.log(query);
        setIsLoading(true);

        const { data, error } = await supabase.schema('admin_boundaries')
                                              .from('admin3')
                                              .select('ogc_fid, adm3_name, adm2_name, adm1_name, center_lat, center_lon')
                                              .or(`or(adm3_name.ilike.%${query}%, adm2_name.ilike.%${query}%, adm1_name.ilike.%${query}%)`);


        if(error){
            setIsLoading(false);
            showErrorToast(t('shared.failedToFetchSearchRes'), `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data.length == 0){
                showInfoToast(t('shared.noSearchRes'), '')
            }

            // set search results using the results obtained
            setLocSearchResults(data);

            setIsLoading(false);
        }
    };

    return(
       <CenterModalBase title={props.title} 
                        closeFunc={()=>{props.hideBadgeModalFunc()}}
                        modalHeight={props.modalHeight}>
            <View style={styles.modalContentContainer}>
                {/* explanation text about what to search */}
                <Text style={styles.searchExplanationTxt}>
                    {t('locationSearchAndPicker.searchExplanation')}
                </Text>

                {/* search area */}
                <View style={styles.locationSearchContainer}>
                    {/* text input for search  */}
                    <TextInput onChangeText={setSearchQuery}
                               style={styles.locationSearchTextInput} />

                    {/* search button */}
                    <TouchableOpacity style={styles.searchLocBtn}
                                      onPress={()=>{searchLoc(searchQuery)}}>
                        <Text style={styles.searchLocBtnTxt}>
                           {t('shared.search')}
                        </Text>
                    </TouchableOpacity>
                </View>

               {/* scroll view for showing search results */}
               <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', width: '100%', rowGap: 15}}
                           style={{width: '100%'}}> 
                    {/* the list of results */}
                    {locSearchResults.map((item, index)=>(
                        <TouchableOpacity key={index} 
                                          style={styles.searchResItemContainer} 
                                          onPress={()=>{handleLocationPick(item)}}>
                                <Text style={styles.searchResItemTxt}>
                                    {item.adm3_name}, {item.adm2_name}, {item.adm1_name}
                                </Text>
                        </TouchableOpacity>
                    ))}
               </ScrollView>
            </View>

            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </CenterModalBase>
    )
};

const styles = StyleSheet.create({
    // content/body container of badge modal
    modalContentContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        flex: 1,
        rowGap: 15
    },
    // container of the area to search for location
    locationSearchContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 15,
        width: '100%'
    },
    // text input for search query
    locationSearchTextInput: {
        borderColor: '#2D3782',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 20,
        color: '#2D3782',
        flex: 1,
        width: '100%'
    },
    // button to search for location
    searchLocBtn: {
        backgroundColor: '#2D3782',
        paddingVertical: 7,
        paddingHorizontal: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    },
    // text inside button to search for location
    searchLocBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center'
    },
    // item container for each search result
    searchResItemContainer: {
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: '#2D3782',
        paddingBottom: 5
    },
    // texts inside search result item container
    searchResItemTxt: {
        color: '#2D3782',
        fontWeight: '600',
        fontSize: 16
    },
    // explanation text about searching
    searchExplanationTxt: {
        color: '#2D3782'
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
});
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

    const handleLocationPick = (locId, 
                                adm3, 
                                cityOrRegency, 
                                province) => {
        props.handleLocationPressFunc(locId, 
                                      adm3, 
                                      cityOrRegency, 
                                      province, 
                                      null,
                                      null, 
                                      false);
        props.hideBadgeModalFunc();
    };

    // function for searching for a location
    const searchLoc = async(query) => {
        console.log(query);
        setIsLoading(true);

        const { data, error } = await supabase.schema('admin_boundaries')
                                              .from('admin3')
                                              .select()
                                              .ilike('adm3_name', `%${query}%`);

        if(error){
            showErrorToast(t('shared.failedToFetchSearchRes'), `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data.length == 0){
                showInfoToast(t('shared.noSearchRes'), '')
            }

            console.log(data);
            // set search results using the results obtained
            setLocSearchResults(data);
        }

        setIsLoading(false);
    };

    return(
       <CenterModalBase title={props.title} 
                        closeFunc={()=>{props.hideBadgeModalFunc()}}
                        modalHeight={props.modalHeight}>
            <View style={styles.modalContentContainer}>
                <View style={styles.locationSearchContainer}>
                    <TextInput onChangeText={setSearchQuery}
                               style={styles.locationSearchTextInput} />

                    <TouchableOpacity style={styles.searchLocBtn}
                                      onPress={()=>{searchLoc(searchQuery)}}>
                        <Text style={styles.searchLocBtnTxt}>
                            {t('shared.search')}
                        </Text>
                    </TouchableOpacity>
                </View>

               <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'column', width: '100%'}}
                           style={{width: '100%'}}>

                    {locSearchResults.map((item, index)=>(
                        <View key={index}>
                            <TouchableOpacity onPress={()=>{handleLocationPick(item?.ogc_fid, 
                                                                               item?.adm3_name, 
                                                                               item?.adm2_name, 
                                                                               item?.adm1_name)}}>
                                <Text>
                                    {item.adm3_name}, {item.adm2_name}, {item.adm1_name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
                <View style={{backgroundColor: 'plum', width: '100%', height: 50, marginBottom: 10}}></View>
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
    locationSearchContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        columnGap: 10,
        width: '100%'
    },
    locationSearchTextInput: {
        borderColor: '#2D3782',
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderRadius: 20,
        flex: 1,
        color: '#2D3782'
    },
    searchLocBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchLocBtnTxt: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16
    },
});
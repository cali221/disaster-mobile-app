import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { getDisasterTitle } from '../../utils/get-disaster-title';
import { DataAttributionSection } from '../../components/DataAttributionSection';

export function ReportMenuScreen({navigation}) {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const [recentDisastersRaw, setRecentDisastersRaw] = useState([]);
    const [recentDisasters, setRecentDisasters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const currentLang = i18n.resolvedLanguage;
    
    // get the disaster titles when language is changed or raw data is changed
    useEffect(()=>{
       setRecentDisasters(recentDisastersRaw.map((item, index) => ({...item, 
                                                                  title: getDisasterTitle(item?.contained_in_area, 
                                                                                          item?.city_or_regency, 
                                                                                          item?.province, 
                                                                                          item?.dist_in_m_from_area, 
                                                                                          item?.disaster_type, 
                                                                                          t, 
                                                                                          i18n)})));

    }, [currentLang, recentDisastersRaw]);
    
    useEffect(()=>{
        // fetch disasters in the last 3 days
        const fetchRecentDisasters = async() => {
            setIsLoading(true);

            const {data, error} = await supabase.schema('public')
                                                .rpc('get_recent_disasters_for_report_menu');

            if(error){
                showErrorToast(t('reportMenuScreen.failedToFetchRecentDisasters'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                if(data){
                    setRecentDisastersRaw(data);
                }
            }

            setIsLoading(false);
        };

        fetchRecentDisasters();
    }, []);



    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.recentDisastersScrollView}
                        contentContainerStyle={[styles.recentDisastersScrollViewContentContainer, 
                                                {paddingBottom: insets.bottom + 50, 
                                                 paddingTop: 30 }]}>
                {/* title text saying 'Disasters in the last 3 days */}
                <Text style={styles.headingTxt}>
                    {t('reportMenuScreen.disastersInTheLastThreeDays')}
                </Text>

                {/* explanation text */}
                <Text style={styles.subheadingTxt}>
                    {t('reportMenuScreen.pickADisasterToCreateAReportFor')}
                </Text>

                {/* data attribution */}
                <DataAttributionSection attributionTxt={t('reportMenuScreen.dataAttribution')} />

                {/* list of disasters in the last 3 days */}
                {recentDisasters.map((item, index) => (
                    <View key={index} style={styles.disasterItemContainer}>
                        <View style={styles.disasterItemTextsContainer}>
                            {/* title text of the disaster item, 
                                showing disaster type and area */}
                            <Text style={styles.disasterItemTitleTxt}>
                                {item.title}
                            </Text>

                            {/* the time of the disaster */}
                            <Text>
                                {new Date(item.datetime).toLocaleString('id', {timeZoneName: 'short'})}
                            </Text>
                        </View>
                        
                        {/* select button */}
                        <TouchableOpacity style={styles.selectBtn} 
                                          onPress={()=>{navigation.navigate('Disaster Details', 
                                                                            {disasterId: item?.disaster_id})}}>
                            <Text style={styles.selectBtnTxt}>
                                {t('shared.select')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* loading overlay shown when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
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
    // scroll view for showing list of recent disasters
    recentDisastersScrollView: {
        backgroundColor: 'white'
    },
    // content container for scroll view of list of recent disasters
    recentDisastersScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
        alignItems: 'center'
    },
    // heading text at the top of the list of recent disasters
    headingTxt: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3782',
        textAlign: 'center'
    },
    // subheading text showing explanation text
    subheadingTxt: {
        fontSize: 16,
        color: '#2D3782',
        textAlign: 'center'
    },
    // container of a recent disaster
    disasterItemContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: 'grey',
        borderWidth: 1,
        padding: 15,
        flexWrap: 'no-wrap',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    // select button for the recent disaster
    selectBtn: {
        width: 80,
        height: 45,
        backgroundColor: '#2D3782',
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // text inside the button to select the recent disaster
    selectBtnTxt: {
        color:'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // container of the texts for the disaster item
    disasterItemTextsContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '70%'
    },
    // title text for disaster item
    disasterItemTitleTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // text showing date and time of the disaster item
    disasterItemDatetimeTxt: {
        fontSize: 16,
        color: '#2D3782'
    }
});
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';

export function ReportMenuScreen() {
    const [recentDisasters, setRecentDisasters] = useState([]);
    
    useEffect(()=>{
        const fetchRecentDisasters = async() => {
            const {data, error} = await supabase.schema('public')
                                                .rpc('get_recent_disasters_for_report_menu');

            if(error){
                showErrorToast('Failed to fetch', `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                if(data){
                    console.log(data);
                    setRecentDisasters(data);
                }
            }
        };

        fetchRecentDisasters();
    }, []);

    return(
        <View>
            <Text>Report Menu Screen Placeholder</Text>
        </View>
    )
};

const styles = StyleSheet.create({

});
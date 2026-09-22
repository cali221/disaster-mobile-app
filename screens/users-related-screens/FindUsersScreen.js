import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState, useContext } from 'react'
import { UsersList } from '../../components/UsersList';
import { supabase } from '../../lib/supabase';
import { showErrorToast, showInfoToast } from '../../utils/show-toast';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { AuthContext } from '../../contexts/AuthContext';

export function FindUsersScreen() {
    const { t, i18n } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResData, setSearchResData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AuthContext);

    // function to search for a user
    const searchUser = async(query, userId) => {
        setIsLoading(true);

        /* get users with username like the query, including data about 
           follow relationship  between them and the authenticated user */
        const {data, error} = await supabase.schema('public')
                                            .rpc('search_user_by_username', 
                                                 {search_query_input: query});

        if(error){
            console.error(error);
            showErrorToast(t('shared.failedToFetchSearchRes'), `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            if(data.length == 0){
                showInfoToast(t('shared.noSearchRes'), '')
            };

            // set search results using the results obtained
            setSearchResData(data);
        };

        setIsLoading(false);
    };

    return(
        <View style={styles.screenContainer}>
            {/* container of search text input and button */}
            <View style={styles.searchContainer}>
                {/* search text input*/}
                <TextInput style={styles.searchTextInput}
                           onChangeText={setSearchQuery}
                           value={searchQuery} />

                {/* search button */}
                <TouchableOpacity style={styles.searchBtn}
                                  onPress={()=>{searchUser(searchQuery, user.id)}}>
                    <Text style={styles.searchBtnTxt}>
                        {t('shared.search')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* users list here */}
            <UsersList data={searchResData}
                       setData={setSearchResData}
                       setIsLoading={setIsLoading} />

            {/* loading ovelay, shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    // container of whole screen
    screenContainer: {
        width: '100%',
        height: '100%',
        padding: 30,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 30,
        alignItems: 'center'
    },
    // text input for search bar
    searchTextInput: {
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderRadius: 50,
        flex: 1,
        color: '#2D3782',
        fontSize: 16
    },
    // container of search text input and button
    searchContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 25
    },
    // search button
    searchBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 20,
        paddingVertical: 7,
        borderRadius: 35
    },
    // search button text
    searchBtnTxt: {
        color: 'white',
        fontWeight: '600'
    }
});
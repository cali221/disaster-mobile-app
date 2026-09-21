import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RotateCw } from 'lucide-react-native';
import { useEffect, useState, useContext } from 'react';
import { getLeaderboard } from '../../utils/users-utilities';
import { AuthContext } from '../../contexts/AuthContext';  
import { LeaderboardList } from '../../components/LeaderboardList';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { showErrorToast } from '../../utils/show-toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function LeaderboardScreen() {
    const { user } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // function to fetch leaderboard data
    const handleLeaderboardRefresh = async (userId) => {
        setIsLoading(true);

        try{
            const fetchedData = await getLeaderboard(userId);
            setLeaderboardData(fetchedData);
        }
        catch(error){
            showErrorToast(t('leaderboardScreen.failedToRefreshLeaderboardData', 
                              `${error.message ?? JSON.stringify(error)}`));
        }

        setIsLoading(false);
    }

    useEffect(()=>{
        if(user?.id){
            setIsLoading(true);

            try{
                getLeaderboard(user.id).then((data)=>{setLeaderboardData(data)});
            }
            catch(error){
                showErrorToast(t('leaderboardScreen.failedToFetchLeaderboardData',  
                            `${error.message ?? JSON.stringify(error)}`));
            }
            
            setIsLoading(false);
        }
    }, [user?.id]);

    return(
        <View style={[styles.screenContainer, {paddingBottom: insets.bottom + 50, 
                                               paddingHorizontal: Math.max(insets.left, insets.right) + 30, 
                                               paddingTop: insets.top + 20}]}>
            <Text style={styles.explanationTxt}>
                {t('leaderboardScreen.onlyMutualsTxt')}
            </Text>

            <View style={styles.headingAndRefreshBtnContainer}>
                <Text style={styles.leaderboardHeadingTxt}>
                    Leaderboard
                </Text>
                
                <TouchableOpacity onPress={()=>{handleLeaderboardRefresh(user.id)}}>
                    <RotateCw size={25} color='#2D3782' />
                </TouchableOpacity>
            </View>

            <LeaderboardList leaderboardData={leaderboardData} />

            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
};

const styles = StyleSheet.create({
    // container of whole screen
    screenContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    // container of heading text and refresh button
    headingAndRefreshBtnContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    // heading text ('Leaderboard')
    leaderboardHeadingTxt: {
        color: '#2D3782',
        fontSize: 18,
        fontWeight: '600'
    },
    // explanation text at the top of the screen
    explanationTxt: {
        textAlign: 'center',
        color: '#535353',
        marginBottom: 25
    }
});

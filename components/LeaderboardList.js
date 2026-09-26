import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Trophy } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export function LeaderboardList(props) {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    
    return(
        <ScrollView contentContainerStyle={styles.leaderboardListContentContainer}
                    style={styles.leaderboardListScrollView}
                    testID='leaderboard-list'>
            {props.leaderboardData &&
                (props.leaderboardData.map((item, index) => {
                    return(
                    <View key={index} 
                          style={[styles.leaderboardItem, 
                                  index!=(props.leaderboardData.length - 1) && {borderBottomWidth: 2}]}
                          testID={`${item.username}-leaderboard-item-container`}>
                        <View style={styles.leaderboardItemTxtsContainer}>
                            {/* username of the user */}
                            <Text style={styles.leaderboardUsernameTxt} 
                                  accessibilityRole='link'
                                  accessibilityLabel={t('leaderboardList.goToUserProfile')}
                                  testID={`user-link-${item.username}`}
                                  onPress={()=>{navigation.navigate('Profile of Another User', 
                                                                    {
                                                                        screenTitle: `@${item.username}`,
                                                                        userId: item.user_id
                                                                    }
                                                                    )}}>
                                @{item.username} {item.user_id == user?.id && `(${t('shared.you')})`}
                            </Text>

                            {/* total XP of the user */}
                            <Text style={styles.leaderboardXpTxt}
                                  testID={`${item.username}-xp-text`}>
                                Total XP: {item.xp}
                            </Text>
                        </View>

                        { 
                            index == 0 && (
                                <Trophy size={30} 
                                        fill={'#eba103'} 
                                        color={'#2D3782'}
                                        testID='leaderboard-trophy' />
                            )  
                        }
                    </View>
                    )
                }))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    leaderboardListScrollView: {
        borderRadius: 20,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white',
        minHeight: 100,
        marginTop: 15,
        maxHeight: 350,
        width: '100%'
    },
    // the list showing the leaderboard
    leaderboardListContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 10,
        height: 'auto'
    },
    // container of each item in the leaderboard
    leaderboardItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomColor: '#2D3782'
    },
    // container of texts for each leaderboard item
    leaderboardItemTxtsContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 5
    },
    // username texts inside the leaderboard
    leaderboardUsernameTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3782'
    },
    // XP texts inside the leaderboard
    leaderboardXpTxt: {
        fontSize: 16,
        color: '#2D3782'
    }
});
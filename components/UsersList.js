import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function LeaderboardList(props) {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    
    return(
        <ScrollView contentContainerStyle={styles.leaderboardListContentContainer}
                    style={styles.leaderboardListScrollView}>
            {props.leaderboardData &&
                (props.leaderboardData.map((item, index) => {
                    return(
                        <View key={index}>

                        </View>
                    )
                }))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
   
});
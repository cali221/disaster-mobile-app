import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AccountSettingsScreen() {
    return(
        <View>
            <ScrollView>

            </ScrollView>

            {/* container of the button to save changes and button to delete account*/}
            <View style={[styles.findUsersBtnContainer, {paddingBottom: insets.bottom}]}>
                {/* button to find other users */}
                <TouchableOpacity>
                    <Text style={styles.findUsersBtnTxt}
                          accessibilityHint='link'>
                        {t('followingFollowersScreen.findUsersToFollowBtnTxt')}
                    </Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )
};

const styles = StyleSheet.create({

});

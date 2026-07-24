import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FollowingFollowersScreen() {
    const insets = useSafeAreaInsets();

    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.listScrollView}
                        contentContainerStyle={styles.listScrollViewContentContainer}>
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
                <View style={{width: '100%', height: 70, backgroundColor: 'plum', marginBottom: 20}} />
            </ScrollView>

            <View style={[styles.findUsersBtnContainer, {paddingBottom: insets.bottom}]}>
                {/* <View style={{backgroundColor: 'white', height: '100%', width: 50}}></View> */}
                <TouchableOpacity style={styles.findUserBtn}>
                    <Text>Find Users to Follow</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    // the screen container
    screenContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        alignContent: 'space-between'
    },
    // the scroll view for showing following/followers list
    listScrollView: {
        backgroundColor: 'white',
        width: '100%'
    },
    /* content container inside the scroll view for 
       showing following/followers list */
    listScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        padding: 30
    },
    /* container of the find users to follow button 
       at bottom of screen ('sticky') */
    findUsersBtnContainer: {
        backgroundColor: 'white',
        height: 200,
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    findUsersBtn: {

    }

});
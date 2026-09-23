/**
 * Map attribution section intended to be placed adjacent to a map using OpenFreeMap.
 * In this app, it's usually on top or bototm of the map
 */
import { View, Text, Linking, StyleSheet } from 'react-native';

export function MapAttribution() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                <Text style={styles.linkTxt} onPress={() => {Linking.openURL('https://openfreemap.org/')}}>OpenFreeMap</Text>{' '}
                <Text style={styles.linkTxt} onPress={() => {Linking.openURL('https://openmaptiles.org/')}}>© OpenMapTiles</Text>
                {' Data from '} 
                <Text style={styles.linkTxt} onPress={() => {Linking.openURL('https://www.openstreetmap.org/copyright')}}>OpenStreetMap</Text>
            </Text>
        </View>
    )
}
    
const styles = StyleSheet.create({
    // the full width contaienr
    container: {
        width: '100%',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the attribution text
    text: {
        color: 'black',
        textAlign: 'center',
        fontSize: 16
    },
    // link text
    linkTxt: {
        color: 'dodgerblue',
        textDecorationLine: 'underline'
    }
});
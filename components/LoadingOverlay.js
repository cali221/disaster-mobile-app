import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';

export function LoadingOverlay() {
    return(
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size='large' color='#9ec110' />
        </View>
    )
}

const styles = StyleSheet.create({
    // the loading overlay background
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: '#060e2bb8',
        zIndex: 100 
    }
})
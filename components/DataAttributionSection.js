import { Text, View, StyleSheet } from 'react-native';

export function DataAttributionSection(props) {
    return(
        <View style={styles.dataAttributionContainer}>
            <Text style={styles.attributionTxt}>
                {props.attributionTxt}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    // container of disaster data attribution texts
    dataAttributionContainer: {
        borderRadius: 20,
        padding: 20,
        display: 'flex',
        backgroundColor: '#D2DAE4',
        borderWidth: 1,
        borderColor: '#2D3782',
        width: '100%'
    },
    // the data attribution text
    attributionTxt: {
        fontSize: 15,
        color: '#2D3782',
        fontWeight: '500'
    }
})
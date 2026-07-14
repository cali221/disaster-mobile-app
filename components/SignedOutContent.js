import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export function SignedOutContent({navigation, originalScreen}){
     return(
        <View style={styles.contentContainer}>
            <Text style={styles.notSignedInTxt}>You are not signed in</Text>
            
            {/* sign in button */}
            <TouchableOpacity style={styles.signInButton} 
                              onPress={()=>{navigation.navigate('Sign In', {originalScreen: originalScreen})}}>
               
                <Text style={styles.signInBtnTxt}>Sign In Here</Text>
            </TouchableOpacity>
        </View>
     )
}

const styles = StyleSheet.create({
    // the container of the content
    contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        rowGap: 20
    },
    // text saying 'You are not signed in'
    notSignedInTxt: {
        fontSize: 18,
        color: '#2D3782',
        fontWeight: 'bold'
    },
    // the sign in button
    signInButton: {
        backgroundColor: '#2D3782',
        height: '7%',
        width: '50%',
        maxWidth: 250,
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    // the text inside sign in button
    signInBtnTxt: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500'
    }
})
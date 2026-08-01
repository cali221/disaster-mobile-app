import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AccountSettingsScreen() {
    const insets = useSafeAreaInsets();

    return(
        <View style={styles.screenContainer}>
            <ScrollView style={styles.screenScrollContainer}
                        contentContainerStyle={styles.screenScrollContentContainer}>
                 {/* username input area */}
                 <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                        Username
                    </Text>

                    <TextInput style={styles.newValTextInput} />
                </View>

                {/* email input area */}
                <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                        Email
                    </Text>

                    <TextInput style={styles.newValTextInput} />
                </View>

                {/* password input area */}
                <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                        Password
                    </Text>
                    
                    <TextInput style={styles.newValTextInput} />
                </View>

                    {/* <View style={{width: '100%', height: 200, marginBottom: 20, backgroundColor: 'pink'}}></View>
                <View style={{width: '100%', height: 200, marginBottom: 20, backgroundColor: 'pink'}}></View>
                <View style={{width: '100%', height: 200, marginBottom: 20, backgroundColor: 'pink'}}></View> */}
            </ScrollView>

            {/* container of the button to save changes and button to delete account*/}
            <View style={[styles.bottomButtonsContainer, {paddingBottom: insets.bottom + 50}]}>
                <TouchableOpacity style={[styles.bottomButtons, styles.saveChangesBtnColor]}>
                    <Text style={styles.bottomButtonsTxt}>
                        Save Changes
                    </Text>
                </TouchableOpacity>

                 <TouchableOpacity style={[styles.bottomButtons, styles.deleteAccountBtnColor]}>
                    <Text style={styles.bottomButtonsTxt}>
                        Delete Account
                    </Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )
};

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    // scroll container of screen content
    screenScrollContainer: {
        width: '100%'
    },
    // content container inside scrll container
    screenScrollContentContainer: {
      padding: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      rowGap: 30
    },
    /* container of the two buttons at the 
       bottom of the screen (always visible) */
    bottomButtonsContainer: {
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderWidth: 1.5,
        borderColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 250,
        padding: 30,
        rowGap: 30
    },
    /* the base of save changes & delete account 
       button without background color */
    bottomButtons: {
        width: '100%',
        maxWidth: 300,
        height: 45,
        borderRadius: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // save changes button background color
    saveChangesBtnColor: {
        backgroundColor: '#2D3782'
    },
    // background color of delete button
    deleteAccountBtnColor: {
        backgroundColor: '#AB5C82'
    },
    // text inside the save changes and delete account button
    bottomButtonsTxt: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600'
    },
    // text input field for new values
    newValTextInput: {
        borderWidth: 1,
        height: 45,
        width: '100%',
        borderRadius: 30
    },
    // container of text input and its label
    newValInputContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        rowGap: 8,
        width: '100%',
        maxWidth: 300
    },
    // labels for text inputs
    txtInputLabel: {
        color: '#2D3782',
        fontSize: 16
    }
});

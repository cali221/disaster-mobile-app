import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../contexts/AuthContext';
import { useState, useContext } from 'react';
import { showErrorToast, showSuccessToast } from '../../utils/show-toast';
import { supabase } from '../../lib/supabase';
import { LoadingOverlay } from '../../components/LoadingOverlay';

export function AccountSettingsScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { user, userProfile, signOut } = useContext(AuthContext);
    const [ passwordVal, setPasswordVal ] = useState('');
    const [ usernameVal, setUsernameVal ] = useState(userProfile?.username ?? '');
    const [ emailVal, setEmailVal ] = useState(user?.user_metadata?.email ?? '');
    const [ isLoading, setIsLoading ] = useState(false);

    // function to handle changing username
    const changeUsername = async(newUsername, authUserId) => {
        const { data, error } = await supabase.schema('users')
                                              .from('profiles_public_data')
                                              .update({ username: newUsername.trim() })
                                              .eq('user_id', authUserId)
        if(error){
            if(error.code == 23505){
                throw new Error(t('authWords.usernameTaken'));
            }
            else if(error.code == 23514){
                throw new Error(t('authWords.invalidUsername'));
            }
            else{
                throw error;
            }
        }
        else{
            const { data, error } = await supabase.auth.updateUser({
                data: { username: newUsername }
            });

            if(error){
                throw error;
            }
        }
    };

    // function to handle changing email
    const changeEmail = async(newEmail) => {
        if(newEmail == ''){
            throw new Error(t('authWords.emailCantBeEmpty'));
        }

        const { data, error } = await supabase.auth.updateUser({
            email: newEmail
        });

        if(error){
            throw error;
        }
    };

    // function to handle changing password
    const changePassword = async(newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if(error){
            throw error;
        }
    };

    // function to handle saving changes
    const handleSaveChanges = async() => {
        try{
            // if username is changed in text input, change username
            if(usernameVal != userProfile?.username){
                await changeUsername(usernameVal, user.id);
            }
            
            // if email is changed in text input, change email
            if(emailVal != user?.user_metadata?.email){
                await changeEmail(emailVal);
            }

            // if password is changed in text input, change password
            if(passwordVal){
                await changePassword(passwordVal);
            }

            // show success message
            showSuccessToast(t('shared.changesSaved', ''));
        }
        catch(error){
            // reset states of the text input to the default values
            setUsernameVal(userProfile?.username ?? '');
            setEmailVal(user?.user_metadata?.email ?? '');
            setPasswordVal('');

            // show error message
            showErrorToast(t('shared.failedToSaveChanges'), 
                           `${error.message ?? JSON.stringify(error)}`);
        };

        setIsLoading(false);
    };

    // function to hangle deleting account
    const handleAccountDelete = async(authUserId) => {
        setIsLoading(true);

        const { data, error } = await supabase.schema('public')
                                              .rpc('delete_authenticated_user');

        if(error){
            showErrorToast(t('authWords.failedToDeleteAccount'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
        else{
            // if successful, show success message and sign out
            showSuccessToast(t('authWords.accountDeleted'));

            try{
                await signOut();
            }
            catch(error){
                showErrorToast();
            }
        }
        
        setIsLoading(false);
    }

    return(
        <View style={[styles.screenContainer, {marginLeft: insets.left, paddingRight: insets.right}]}>
            <ScrollView style={styles.screenScrollContainer}
                        contentContainerStyle={styles.screenScrollContentContainer}>
                 {/* username input area */}
                 <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                       {t('authWords.username')}
                    </Text>

                    <TextInput style={styles.newValTextInput} 
                               value={usernameVal}
                               onChangeText={setUsernameVal} />
                </View>

                {/* email input area */}
                <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                        {t('authWords.email')}
                    </Text>

                    <TextInput style={styles.newValTextInput} 
                               value={emailVal}
                               onChangeText={setEmailVal} />
                </View>

                {/* reset password input area */}
                <View style={styles.newValInputContainer}>
                    <Text style={styles.txtInputLabel}>
                        {t('authWords.createNewPassword')}
                    </Text>
                    
                    <TextInput style={styles.newValTextInput}
                               value={passwordVal}
                               onChangeText={setPasswordVal} />
                </View>
            </ScrollView>

            {/* container of the button to save changes and button to delete account*/}
            <View style={[styles.bottomButtonsContainer, {paddingBottom: insets.bottom + 50}]}>
                {/* button to save changes */}
                <TouchableOpacity style={[styles.bottomButtons, styles.saveChangesBtnColor]}
                                  accessibilityRole='button'
                                  onPress={()=>{handleSaveChanges()}}>
                    <Text style={styles.bottomButtonsTxt}>
                        {t('shared.saveChanges')}
                    </Text>
                </TouchableOpacity>

                {/* button to delete account */}
                <TouchableOpacity style={[styles.bottomButtons, styles.deleteAccountBtnColor]}
                                  onPress={()=>{handleAccountDelete(user.id)}}
                                  accessibilityRole='button'>
                    <Text style={styles.bottomButtonsTxt}>
                        {t('authWords.deleteAccount')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* loading ovelay, shown only when isLoading is true */}
            {
                isLoading == true && (
                    <LoadingOverlay />
                )
            }
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
    // content container inside scroll container
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
        backgroundColor: '#F4F4F4',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderWidth: 1.5,
        borderColor: '#2D3782',
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
        borderRadius: 30,
        paddingHorizontal: 20,
        color: 'black'
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

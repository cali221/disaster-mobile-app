import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CenterModalBase(props) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    return(
        <View style={[styles.modalOverlay, {paddingTop: insets.top, 
                                            paddingLeft: insets.left, 
                                            paddingRight: insets.right,
                                            paddingBottom: insets.bottom}]}>
            {/* the base of the modal */}
            <View style={styles.modalBase}>
                {/* the modal header with title and close button */}
                <View style={styles.modalHeader}>
                    {/* modal title */}
                    <Text style={styles.modalTitleTxt}>
                        {props.title} 
                    </Text>

                    {/* close button */}
                    <TouchableOpacity style={styles.closeBtn} 
                                      onPress={props.closeFunc}>
                        <XCircle size={25} color='#2D3782' />
                        <Text style={styles.closeBtnTxt}>
                            {t('shared.close')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {props.children}
                </View>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    // the darkened background behind the modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: '#04091fb8',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    // the modal base/template
    modalBase: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 30,
        width: '75%',
        borderRadius: 50,
        paddingHorizontal: 30,
        paddingTop: 35,
        paddingBottom: 50,
        backgroundColor: 'white',
        elevation: 2,
        maxWidth: 350,
        maxHeight: (Dimensions.get('window').height * 0.6) - 50
    },
    // the modal header with title and close button
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        width: '100%',
        
    },
    // the close button with X icon and 'Close' text
    closeBtn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    // the 'Close' text of the close button
    closeBtnTxt: {
        fontSize: 15,
        color: '#2D3782',
        fontWeight: '600'
    },
    // the modal title text
    modalTitleTxt: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3782',
        maxWidth: 300,
        width: '70%'
    },
    // modal body/content container
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%'
    }
});
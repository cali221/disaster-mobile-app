import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BottomModalBase(props) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();

    return(
        <View style={[styles.modalOverlay, {paddingTop: insets.top, 
                                            paddingLeft: insets.left, 
                                            paddingRight: insets.right}]}>
            {/* the base of the modal */}
            <View style={[styles.modalBase, {minHeight: props?.minHeight ? props.minHeight : 100}]}>
                {/* the modal header with title and close button */}
                <View style={styles.modalHeader}>
                    {/* modal title */}
                    <Text style={styles.modalTitleTxt}>
                        {props.modalTitle} 
                    </Text>

                    {/* close button */}
                    <TouchableOpacity style={styles.closeBtn} 
                                      onPress={props.closeFunc}
                                      accessibilityRole='button'>
                        <XCircle size={25} color='#2D3782' />
                        <Text style={styles.closeBtnTxt}>
                            {t('shared.close')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={[styles.contentScrollView, {marginBottom: insets.bottom + 35}]}
                            contentContainerStyle={styles.contentScrollViewContentContainer}>
                    {/* content of the modal */}
                    {props.children}
                </ScrollView>
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
        justifyContent:'flex-end',
        backgroundColor: '#04091fb8',
        zIndex: 100,
        alignItems: 'center'
    },
    // the modal base/template
    modalBase: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        rowGap: 30,
        width: '100%',
        maxWidth:  500,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingHorizontal: 30,
        paddingTop: 35,
        maxHeight: (Dimensions.get('window').height * 0.8) - 50,
        elevation: 2
    },
    // the modal header with title and close button
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        width: '100%'
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
        fontSize: 16,
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
    // scroll view container of the modal content
    contentScrollView: {
        width: '100%'
    },
    // content container of the scroll view container of the modal content
    contentScrollViewContentContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
    }
});
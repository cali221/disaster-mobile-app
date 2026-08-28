import { View, 
         Text, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function DisasterGuideTemplate(props) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [pickedStage, setPickedStage] = useState('During');

    return(
        <View style={styles.screenContainer}>
            {/* horizontal scroll view for containing the 
                top menu for picking the disaster stage 
                to view guidance on */}
            <ScrollView horizontal={true} 
                        contentContainerStyle={[styles.topMenuScrollContentContainer, 
                                                {paddingLeft: Math.max(insets.left, insets.right) + 20, 
                                                 paddingRight: Math.max(insets.left, insets.right) + 20,
                                                 paddingTop: insets.top}]}
                        style={styles.topMenuScrollView}>
                {/* 'Before' button */}
                <TouchableOpacity style={[styles.topMenuBtn, 
                                          pickedStage == 'Before' ? 
                                          styles.pickedMenuBtnColor :
                                          styles.unpickedMenuBtnColor]}
                                  onPress={()=>{setPickedStage('Before')}}>
                    <Text style={[styles.topMenuBtnTxt, 
                                  pickedStage == 'Before' ? 
                                  styles.pickedMenuBtnTxtColor : 
                                  styles.unpickedMenuBtnTxtColor]}>
                        {t('disasterGuide.before')}
                    </Text>
                </TouchableOpacity>

                {/* 'During' button */}
                <TouchableOpacity style={[styles.topMenuBtn, 
                                          pickedStage == 'During' ? 
                                          styles.pickedMenuBtnColor : 
                                          styles.unpickedMenuBtnColor]}
                                  onPress={()=>{setPickedStage('During')}}>
                     <Text style={[styles.topMenuBtnTxt, 
                                  pickedStage == 'During' ? 
                                  styles.pickedMenuBtnTxtColor : 
                                  styles.unpickedMenuBtnTxtColor]}>
                        {t('disasterGuide.during')}
                    </Text>
                </TouchableOpacity>

                {/* 'After' button */}
                <TouchableOpacity style={[styles.topMenuBtn, 
                                          pickedStage == 'After' ? 
                                          styles.pickedMenuBtnColor : 
                                          styles.unpickedMenuBtnColor]}
                                  onPress={()=>{setPickedStage('After')}}>
                    <Text style={[styles.topMenuBtnTxt, 
                                  pickedStage == 'After' ? 
                                  styles.pickedMenuBtnTxtColor : 
                                  styles.unpickedMenuBtnTxtColor]}>
                        {t('disasterGuide.after')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* vertical scroll view for showing 
                disaster guidance content */}
            <ScrollView style={[styles.guideContentScrollView, 
                                {paddingLeft: Math.max(insets.left, insets.right) + 20, 
                                 paddingRight: Math.max(insets.left, insets.right) + 20,
                                 paddingBottom: insets.bottom + 70}]}
                        contentContainerStyle={styles.guideContentScrollViewContentContainer}>
                <View style={{width: '100%', backgroundColor: 'plum', height: 250, marginBottom: 20}}></View>
                <View style={{width: '100%', backgroundColor: 'plum', height: 250, marginBottom: 20}}></View>
                <View style={{width: '100%', backgroundColor: 'plum', height: 250, marginBottom: 20}}></View>
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    // container of the screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    /* horizontal scroll view for the top menu for 
       picking disaster stage to view guidance for */
    topMenuScrollView: {
       height: 120,
       flexGrow: 0
    },
    // content container for the top menu
    topMenuScrollContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 30
    },
    /* vertical scroll view 
       for the guidance content */
    guideContentScrollView: {
        width: '100%',
        flex: 1
    },
    /* content container for the scroll 
       view showing the guidance content */
    guideContentScrollViewContentContainer: {
        width: '100%'
    },
    /* buttons inside the horizontal 
       scroll view for the top menu */
    topMenuBtn: {
        paddingHorizontal: 10,
        minWidth: 150,
        maxWidth: 250,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    /* text inside buttons inside 
       the horizontal scroll view 
       for the top menu  */
    topMenuBtnTxt: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center'
    },
    // button color for the picked disaster stage
    pickedMenuBtnColor: {
        backgroundColor: '#2D3782'
    },
    /* button color for the disaster 
       stage that's not picked */
    unpickedMenuBtnColor: {
        backgroundColor: '#D2DAE4'
    },
    /* text color inside the button for 
       the picked disaster stage */
    pickedMenuBtnTxtColor: {
        color: 'white'
    },
    /* text color inside the button for 
       the disaster stage that is not picked */
    unpickedMenuBtnTxtColor: {
        color: '#2D3782'
    }
});
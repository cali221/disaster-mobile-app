import { View, 
         Text, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { showErrorToast } from '../utils/show-toast';

export function DisasterGuideTemplate(props) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [pickedStage, setPickedStage] = useState('During');
    const [guideTextsToShow, setGuideTextsToShow] = useState(null);

    useEffect(()=>{
        if(pickedStage == 'Before' && props?.guideTranslationKeys?.before){
            setGuideTextsToShow(props?.guideTranslationKeys?.before);
        }
        else if(pickedStage == 'During' && props?.guideTranslationKeys?.during){
            setGuideTextsToShow(props?.guideTranslationKeys?.during);
        }
        else if(pickedStage == 'After' && props?.guideTranslationKeys?.after){
            setGuideTextsToShow(props?.guideTranslationKeys?.after);
        }
        else{
            showErrorToast(t('shared.somethingWentWrong'), '');
        }
    }, [pickedStage]);

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
                                 paddingBottom: insets.bottom + 70,
                                 paddingTop: 20}]}
                        contentContainerStyle={styles.guideContentScrollViewContentContainer}>
               {
                // show steps to do
                guideTextsToShow?.map((item, index) => (
                    <View key={index} style={styles.guideStepContainer}>
                        {/* the step number */}
                        <View style={styles.guideStepNumberContainer}>
                            <Text style={styles.guideStepNumberTxt}>
                                {index + 1}
                            </Text>
                        </View>

                        {/* the step's text */}
                        <View style={styles.guideStepTxtContainer}>
                            <Text style={styles.guideStepTxt}>
                                {t(item)}
                            </Text>
                        </View>
                    </View>
                ))
               }
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
        width: '100%'
    },
    /* content container for the scroll 
       view showing the guidance content */
    guideContentScrollViewContentContainer: {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
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
        fontSize: 18,
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
    },
    // container of each step 
    guideStepContainer: {
        backgroundColor: '#D2DAE4',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        columnGap: 20,
        paddingHorizontal: 30,
        paddingVertical: 20,
        flexShrink: 1
    },
    // step number container
    guideStepNumberContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2D3782'
    },
    // step number text
    guideStepNumberTxt: {
        color: 'white',
        fontSize: 25,
        fontWeight: '600'
    },
    // text describing the step
    guideStepTxt: {
        color: '#2D3782',
        fontSize: 20,
        fontWeight: '600'
    },
    // container of the step text
    guideStepTxtContainer: {
        flex: 1
    }
});
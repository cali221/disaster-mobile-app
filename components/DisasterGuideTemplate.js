import { View, 
         Text, 
         StyleSheet, 
         TouchableOpacity, 
         ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { showErrorToast } from '../utils/show-toast';
import { ArrowBigUp } from 'lucide-react-native';

/* TODO: need to add disclaimers about accuracy 
(due to lack of expertise in these topics as a student) 
and possibly disclaimer about not including citation/sources 
(disaster guidelines are considered to be general concepts/knowledge for now and 
want to make the guidelines as concise as possible) (?) */
export function DisasterGuideTemplate(props) {
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const [pickedStage, setPickedStage] = useState('During');
    const [guideTextsToShow, setGuideTextsToShow] = useState(null);
    const scrollViewRef = useRef(null);

    useEffect(()=>{
        // scroll back to top when a new stage is picked
        scrollViewRef.current.scrollTo({ y: 0, animated: false });

         /* set texts to show according to picked stage 
            and add section vertical position property 
            for each section */
        if(pickedStage == 'Before' && props.guideContent.before){
            setGuideTextsToShow(props?.guideContent?.before?.map((item, index) => {return {...item, sectionYPos: null}}));
        }
        else if(pickedStage == 'During' && props.guideContent.during){
            setGuideTextsToShow(props?.guideContent?.during?.map((item, index) => {return {...item, sectionYPos: null}}));
        }
        else if(pickedStage == 'After' && props.guideContent.after){
            setGuideTextsToShow(props?.guideContent?.after?.map((item, index) => {return {...item, sectionYPos: null}}));
        }
        else{
            showErrorToast(t('shared.somethingWentWrong'), '');
        }
    }, [pickedStage]);

    return(
        <View style={styles.screenContainer}>
            <TouchableOpacity style={styles.scrollToTopBtn} 
                              onPress={()=>{scrollViewRef.current.scrollTo({ y: 0, animated: true })}}>
                <ArrowBigUp fill={'white'} size={45} stroke={'white'} />

                <Text style={styles.scrollToTopBtnTxt}>
                    {t('disasterGuide.scrollToTop')}
                </Text>
            </TouchableOpacity>

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
            <ScrollView style={styles.guideContentScrollView}
                        ref={scrollViewRef}
                        contentContainerStyle={[styles.guideContentScrollViewContentContainer, 
                                                {paddingLeft: Math.max(insets.left, insets.right) + 20, 
                                                 paddingRight: Math.max(insets.left, insets.right) + 20,
                                                 paddingBottom: insets.bottom + 200,
                                                 paddingTop: 20}]}>

                <View style={styles.sectionsListContainer}>
                    <Text style={styles.sectionsHyperlinksHeadingTxt}>
                        {t('disasterGuide.sections')}:
                    </Text>

                    <View style={styles.sectionsHyperlinksContainer}>
                        { 
                            guideTextsToShow?.map((sectionItem, sectionIndex) => (
                                <TouchableOpacity onPress={() => {scrollViewRef.current.scrollTo({y: sectionItem.sectionYPos, animated:true})}} 
                                                key={sectionIndex}>
                                    <Text style={styles.sectionHyperlinkTxt}>
                                        {t(sectionItem.heading)}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </View>

                {
                // show steps to do
                guideTextsToShow?.map((sectionItem, sectionIndex) => (
                    <View key={sectionIndex} 
                          style={styles.guideSectionContainer}
                          onLayout={(event) => {sectionItem.sectionYPos = event.nativeEvent.layout.y }}>
                        <Text style={styles.sectionHeadingTxt}>
                            {t(sectionItem.heading)}
                        </Text>

                        {sectionItem?.texts?.map((textItem, textIndex) => (
                            <View style={styles.guideStepContainer} key={textIndex}>
                                {/* the step number */}
                                <View style={styles.guideStepNumberContainer}>
                                    <Text style={styles.guideStepNumberTxt}>
                                        {textIndex + 1}
                                    </Text>
                                </View>

                                {/* the step's text */}
                                <View style={styles.guideStepTxtContainer}>
                                    <Text style={styles.guideStepTxt}>
                                        {t(textItem)}
                                    </Text>
                                </View>
                            </View>
                        ))}
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
       flexGrow: 0,
       minHeight: 120,
       maxHeight: 220
    },
    // content container for the top menu
    topMenuScrollContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        display: 'flex',
        flexDirection: 'column',
        rowGap: 45
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
        paddingVertical: 30
    },
    // step number container
    guideStepNumberContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2D3782'
    },
    // step number text
    guideStepNumberTxt: {
        color: 'white',
        fontSize: 22,
        fontWeight: '600'
    },
    // text describing the step
    guideStepTxt: {
        color: '#2D3782',
        fontSize: 20,
        fontWeight: '600',
    },
    // container of the step text
    guideStepTxtContainer: {
        flex: 1
    },
    // text showing each section heading
    sectionHeadingTxt: {
        fontSize: 23,
        fontWeight: '600',
        color: '#2D3782'
    },
    // each stage's content sections
    guideSectionContainer: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        rowGap: 30
    },
    // button to scroll to top of the screen
    scrollToTopBtn: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 100,
        height: 100,
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3782',
        elevation: 3,
        zIndex: 5,
        padding: 10
    },
    /* text inside button to scroll 
       to top of the screen */
    scrollToTopBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center'
    },
    /* container of hyperlinks in the section 
       containing sections list */
    sectionsHyperlinksContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        rowGap: 20
    },
    // the section containing list of sections shown
    sectionsListContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        rowGap: 15,
        backgroundColor: '#2D3782',
        padding: 22,
        borderRadius: 20
    },
    /* hyperlink texts for scrolling to 
       the corresponding section */
    sectionHyperlinkTxt: {
       fontSize: 20,
       fontWeight: '600',
       color: 'white',
       textDecorationLine: 'underline'
    },
    /* section heading for section containing 
       hyperlinks to the sections shown */
    sectionsHyperlinksHeadingTxt: {
        fontSize: 23,
        fontWeight: '600',
        color: 'white'
    }
});
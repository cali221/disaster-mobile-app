import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function FlashcardsScreen() {
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const [ isShowingAns, setIsShowingAns ]= useState(false);
    const [ deckArr, setDeckArr ] = useState([]);
    const [ deckIndexViewed, setDeckIndexViewed ] = useState(0);
    const flashcardEaseValRangeArr = [...Array(5 + 1).keys()];

    useEffect(()=>{
        const fetchFlashcard = async() => {
            const { data, error } = await supabase.schema('public')
                                                  .rpc('get_flashcards_to_review_for_auth_user');
        
            if(error){
                throw error;
            }
            else{
                setDeckArr(data);
            }
        };

        fetchFlashcard();
    }, []);

    return(
        <View style={[styles.screenContainer, 
                      {paddingLeft: insets.left, 
                       paddingRight: insets.right}]}>
            <ScrollView style={styles.screenScrollContainer}
                        contentContainerStyle={styles.screenScrollContentContainer}>
                <View>
                    <Text>
                        {isShowingAns == false ? deckArr[deckIndexViewed]?.front : deckArr[deckIndexViewed]?.back}
                    </Text>
                </View>
            </ScrollView>

             <View style={[styles.bottomSection, 
                          {paddingBottom: insets.bottom + 50, 
                           paddingLeft: insets.left + 30, 
                           paddingRight: insets.right + 30}]}>
                
                {
                    isShowingAns == true ? (
                        <View style={styles.flashcardBtnsAndExplanationTxtsContainer}>

                            <View style={styles.flashcardBtnsExplanationTxtsContainer}>
                                <Text style={styles.explanationTxt}>
                                    {t('flashcardScreen.pickHowEasilyYouRecalled')}.    
                                </Text>

                                <Text style={styles.explanationTxt}>
                                    0: {t('flashcardScreen.completelyForgot')} {'\n'}
                                    5: {t('flashcardScreen.easyAndCorrectRecall')}
                                </Text>
                            </View>

                            <View style={styles.bottomButtonsContainer}>
                                {
                                    (flashcardEaseValRangeArr?.map((item, index) => {
                                        return(
                                            <TouchableOpacity style={styles.flashcardEaseValBtn}
                                                            key={index}>
                                                <Text style={styles.flashcardEaseValBtnTxt}>{item}</Text>
                                            </TouchableOpacity>
                                        )
                                    }))
                                }
                            </View>
                        </View>
                    ):
                    (
                        <TouchableOpacity style={styles.showAnsBtn}
                                          onPress={()=>{setIsShowingAns(true)}}>
                            <Text style={styles.showAnsBtnTxt}>
                                {t('flashcardScreen.showAnswer')}
                            </Text>
                        </TouchableOpacity>  
                    )
                }
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
    /* bottom section containing the show answer button 
       or flashcard buttons and explanation texts */
    bottomSection: {
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        borderWidth: 1.5,
        borderColor: '#2D3782',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: 200,
        backgroundColor: '#F4F4F4',
        rowGap: 20,
        paddingTop: 30
    },
    /* container of flashcard buttons at bottom of 
       screen (always visible) */
    bottomButtonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        rowGap: 30,
        columnGap: 20,
        maxWidth: 270
    },
    // buttons for picking recall ease 
    flashcardEaseValBtn: {
        width: 50, 
        height: 50, 
        borderRadius: 25,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3782',
        elevation: 3
    },
    // text inside the buttons for picking recall ease 
    flashcardEaseValBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // container of explanation texts for recall ease buttons
    flashcardBtnsExplanationTxtsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 10
    },
    // explanation texts for recall ease buttons
    explanationTxt: {
        textAlign: 'center',
        fontSize: 15,
        color: '#2D3782'
    },
    /* content container inside the bottom section 
       for recall ease buttons and explanation texts */
    flashcardBtnsAndExplanationTxtsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        rowGap: 20
    },
    // button to show answer (back of flashcard)
    showAnsBtn: {
        backgroundColor: '#2D3782',
        paddingVertical: 12,
        paddingHorizontal: 70,
        borderRadius: 50
    },
    // text inside button to show answer (back of flashcard)
    showAnsBtnTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        elevation: 2
    }
});
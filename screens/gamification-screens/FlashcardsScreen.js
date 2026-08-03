import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { UserProfilePicture } from '../../components/UserProfilePicture';

export function FlashcardsScreen() {
    const insets = useSafeAreaInsets();
    const { userProfile } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [ isShowingAns, setIsShowingAns ]= useState(false);
    const [ deckArr, setDeckArr ] = useState([]);
    const flashcardEaseValRangeArr = [...Array(5 + 1).keys()];
    const currentLang = i18n.resolvedLanguage;

    const handleEaseValButtonPress = async() => {
        // if array is not empty, remove last item, update state and stop showing answer
        if(deckArr.length > 0){
            // TODO: add SM-2 logic and inserting/updating DB

            const newDeckArr = deckArr.filter((item, index) => index !== deckArr.length - 1)
            setDeckArr(newDeckArr);
            setIsShowingAns(false);
        }
    }

    useEffect(()=>{
        // function to get flashcards to review for the authenticated user
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

        // fetch flashcards to review for authenticated user
        fetchFlashcard();
    }, []);

    return(
        
        <View style={[styles.screenContainer, 
                      {paddingLeft: insets.left, 
                       paddingRight: insets.right}]}>
            {
                deckArr.length > 0 ? 
                (
                    // when there are flashcards to review show them
                    <View style={styles.contentContainerWhenDeckIsNotEmpty}>
                        <ScrollView style={styles.screenScrollContainer}
                                    contentContainerStyle={styles.screenScrollContentContainer}>
                            <View style={styles.avatarAndExplanationContainer}>
                                <UserProfilePicture imgUrl={userProfile?.avatar_img_url} 
                                                    width={120} 
                                                    height={120} 
                                                    bgColor='#D2DAE4' 
                                                    pfpBorderRadius={20} />
                                <Text style={styles.avatarExplanationTxt}>
                                    {t('flashcardScreen.keepReviewing')}
                                </Text>
                            </View>

                            <View style={styles.textContentContainer}>
                                {/* heading text indicating flashcard front/back */}
                                <Text style={styles.flashcardHeadingTxt}>
                                    { isShowingAns == false ? 
                                            (
                                               t('flashcardScreen.flashcardFrontHeading')
                                            ) : 
                                            (
                                               t('flashcardScreen.flashcardBackHeading')
                                            )
                                    }
                                </Text>

                                {/* text informing user they may need to 
                                    scroll to view all text */}
                                <Text style={styles.mayNeedToScrollTxt}>
                                    {t('flashcardScreen.youMayNeedToScroll')}
                                </Text>

                                {/* the flashcar's content text */}
                                <Text style={styles.flashcardContentTxt}>
                                    { isShowingAns == false ? 
                                            (
                                                currentLang  == 'id' ?
                                                deckArr[deckArr.length - 1]?.front_idn : 
                                                deckArr[deckArr.length - 1]?.front
                                            ) : 
                                            (
                                                currentLang  == 'id' ?
                                                deckArr[deckArr.length - 1]?.back_idn : 
                                                deckArr[deckArr.length - 1]?.back
                                            )
                                    }
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={[styles.bottomSection, 
                                      {paddingBottom: insets.bottom + 50, 
                                       paddingLeft: insets.left + 30, 
                                       paddingRight: insets.right + 30}]}>
                            {isShowingAns == true ? (
                                /* if showing answer, show the recall ease option 
                                    buttons and the explanation texts */
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
                                                                        key={index}
                                                                        onPress={()=>{handleEaseValButtonPress()}}>
                                                        <Text style={styles.flashcardEaseValBtnTxt}>{item}</Text>
                                                    </TouchableOpacity>
                                                )
                                            }))
                                        }
                                    </View>
                                </View>
                            ):
                            (
                                // if not showing answer, show the 'Show Answer' button
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
                ):
                (
                    // when there is no flashcard to review show text informing user
                    <View style={styles.contentContainerWhenDeckIsEmpty}>
                        <Text style={styles.noFlashcardsToReviewTxt}>
                            {t('flashcardScreen.noFlashcardToReview')} 🎉
                        </Text>
                    </View>
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
    // content container inside scrll container
    screenScrollContentContainer: {
      padding: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      rowGap: 30
    },
    // container of content shown when deck is not empty
    contentContainerWhenDeckIsNotEmpty: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    // container of content shown when deck is empty
    contentContainerWhenDeckIsEmpty: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    // text shown when there are no flashcards to review
    noFlashcardsToReviewTxt: {
        fontSize: 18,
        color: '#2D3782',
        fontWeight: '600'
    },
    // container of current user's avatar and explanation text
    avatarAndExplanationContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 30,
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white',
        borderRadius: 30
    },
    // explanation text about connection to avatar
    avatarExplanationTxt: {
        flex: 1,
        fontSize: 14,
        color: '#2D3782',
        maxWidth: 150
    },
    // container of text content of the flashcard
    textContentContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        rowGap: 5,
        width: '100%'
    },
    // 'Flashcard Front'/'Flashcard Back' heading text
    flashcardHeadingTxt: {
        color: '#2D3782',
        fontSize: 17,
        fontWeight: '600'
    },
    /* text saying the user may need 
       to scroll down to view all texts */
    mayNeedToScrollTxt: {
        color: '#2D3782',
        fontSize: 15,
        fontWeight: '600'
    },
    // flashcard content text
    flashcardContentTxt: {
        marginTop: 20,
        color: '#2D3782',
        fontSize: 16
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
        width: 40, 
        height: 40, 
        borderRadius: 20,
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
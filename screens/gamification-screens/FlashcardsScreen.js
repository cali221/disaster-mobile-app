import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { UserProfilePicture } from '../../components/UserProfilePicture';
import { showErrorToast } from '../../utils/show-toast';
import { getCardUpdatedValsUsingSM2 } from '../../utils/flashcards-utilities';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { useAudioPlayer } from 'expo-audio';
import { useIsFocused } from '@react-navigation/native';
import { MuteUnmuteButton } from '../../components/MuteUnmuteButton';
import { LanguageChangeButton } from '../../components/LanguageChangeButton';

const bgMusic = require('../../assets/audio/bg-song/442911__scicodedev__calm_happy_rpgtownbackground.mp3');
const bonkSound = require('../../assets/audio/bonk/466202__harrisando__bonk.wav');
const powerupSound = require('../../assets/audio/powerup/242501__gabrielaraujo__powerupsuccess.wav');

export function FlashcardsScreen({navigation}) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const { user, userProfile, fetchAndSetProfileData } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const [ isShowingAns, setIsShowingAns ]= useState(false);
    const [ deckArr, setDeckArr ] = useState([]);
    const flashcardEaseValRangeArr = [...Array(5 + 1).keys()];
    const currentLang = i18n.resolvedLanguage;
    const [isLoading, setIsLoading] = useState(false);
    const [shouldPlayBgSong, setShouldPlayBgSong] = useState(true);

    // background music player set up
    const bgMusicPlayer = useAudioPlayer(bgMusic);
    bgMusicPlayer.loop = true;
    bgMusicPlayer.volume = 0.6;

    // bonk sound player set up
    const bonkSoundPlayer = useAudioPlayer(bonkSound);
    bonkSoundPlayer.loop = false;
    bonkSoundPlayer.volume = 1;

    // powerup sound player set up
    const powerupSoundPlayer = useAudioPlayer(powerupSound);
    bonkSoundPlayer.loop = false;
    bonkSoundPlayer.volume = 1;

    // function to increment the user's total number of flashcard review by 1
    const updateUserFlashcardReviewNumber = async() => {
        const { data, error } = await supabase.schema('public')
                                              .rpc('increment_auth_user_flashcard_review_times');

        if(error){
            throw error;
        }
    };

    // function to upsert card to users_flashcards junction table
    const updateUserFlashcardsData = async(newUserFlashcardObj) => {        
        const {data, error} = await supabase.schema('users')
                                            .from('users_flashcards')
                                            .upsert(newUserFlashcardObj, 
                                                   {onConflict: 'user_id, flashcard_id'});

        if(error){
            throw error;
        }
    };

    /* function to handle recall ease value button press. 

       Behavior based on SM-2 algorithm described on https://super-memory.com/english/ol/sm2.htm 
       and observations made after trying the SuperMemo 2.s Shareware,
       downloaded from https://supermemopedia.com/wiki/Download_SuperMemo 
       (the software download link is shown as 'SuperMemo 2 for DOS' on the web page).
       SuperMemo 2 uses SM-2 algorithm as implied on 
       https://supermemo.guru/wiki/Algorithm_SM-2 */
    const handleEaseValButtonPress = async(cardReps, 
                                           cardInterval, 
                                           cardEaseFactor, 
                                           recallEaseVal) => {
        setIsLoading(true);

        try{
            // if array is not empty, update card data and stop showing answer
            if(deckArr.length > 0){
                // initialize new deck array as a copy of the deck array
                let newDeckArr = [...deckArr];

                // the card that was just reviwed
                const reviewedCard = deckArr[0];

                // update profile flashcard reviewed number (increment by 1)
                await updateUserFlashcardReviewNumber();
                
                // get card's new stats using SM-2
                const {newCardInterval, 
                       newCardReps, 
                       newCardEF, 
                       newDueDate} = getCardUpdatedValsUsingSM2(cardReps, 
                                                                cardInterval, 
                                                                cardEaseFactor, 
                                                                recallEaseVal);

                /* update the reviewed card in the deck new array accordingly,
                   if recall ease value quality is less than 4, 
                   repeat again after the session but the later repetitions 
                   won't contribute to the card's stats for the user */
                newDeckArr[0] = {
                    ...reviewedCard,
                    is_repeating: recallEaseVal < 4 ? true : false, 
                    card_interval: newCardInterval,
                    card_repetition: newCardReps,
                    card_ease_factor: newCardEF,
                    due_at: newDueDate
                };

                /* if the card was not reviewed as a part of repetition after session, 
                   upsert the updated card's stats for the user */
                if(reviewedCard.is_repeating == false){
                    // new user's card data to upsert
                    const newUserFlashcardObj = {
                        card_interval: newDeckArr[0].card_interval, 
                        card_repetition: newDeckArr[0].card_repetition, 
                        card_ease_factor: newDeckArr[0].card_ease_factor, 
                        due_at: newDeckArr[0].due_at,
                        flashcard_id: newDeckArr[0].flashcard_id,
                        user_id: user.id
                    };

                    // upsert user's flashcard data
                    await updateUserFlashcardsData(newUserFlashcardObj);
                };

                if(recallEaseVal < 4){
                    /* if the recall ease value is less than 4,
                       push the reviewed card (with updated stats)
                       to the end of array to be reviewed again after
                       the session */
                    newDeckArr.push(newDeckArr[0]);

                    // play bonk sound effect
                    bonkSoundPlayer.seekTo(0);
                    bonkSoundPlayer.play();
                }
                else{
                    // play powerup sound effect
                    powerupSoundPlayer.seekTo(0);
                    powerupSoundPlayer.play();
                };
                
                // remove the reviewed card from the deck
                newDeckArr = newDeckArr.filter((card, index) => index !== 0);

                setDeckArr(newDeckArr);
                setIsShowingAns(false);
            }
        }
        catch(error){
            showErrorToast(t('flashcardScreen.failedToProcessFlashcard'), 
                           `${error.message ?? JSON.stringify(error)}`);
        };

        setIsLoading(false);
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
                /* add is_repeeating property to track if the card is reviewed 
                   in a new session or if it's a card repeated after session because 
                   its last recall ease value was rated < 4 */
                const deck = data.map((card) => {return {...card, is_repeating: false, reference: card.reference?.sort((a, b) => a.index - b.index)}})

                setDeckArr(deck);
            }
        };

        // function to fetch flashcards and profile data
        const tryToFetchFlashcardsAndProfileData = async () => {
            try{
                setIsLoading(true);

                // fetch flashcards to review for authenticated user
                await fetchFlashcard();

                // fetch the user's profile data (to get current avatar)
                await fetchAndSetProfileData(user?.id);

                setIsLoading(false);
            }
            catch(error){
                showErrorToast(t('flashcardsScreen.failedToFetchFlashcardsAndProfileData'), 
                                 `${error.message ?? JSON.stringify(error)}`);
            }
        };

        tryToFetchFlashcardsAndProfileData();

    }, []);

    useEffect(()=>{
        // when the screen is in focus play the background music, otherwise pause it
        if(isFocused == true && shouldPlayBgSong){
            bgMusicPlayer.seekTo(0);
            bgMusicPlayer.play();
        }
        else{
            bgMusicPlayer.pause();
        }
    }, [isFocused, shouldPlayBgSong])

    /* if deck array state changes, refetch and update user profile so 
       that the updated user avatar is shown */
    useEffect(()=>{
        fetchAndSetProfileData(user.id);
    }, [deckArr]);

    // set up the header buttons
    useEffect(()=>{
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerBtnsContainer}>
                    {/* mute/unmute button for background song */}
                    <MuteUnmuteButton isMuted={shouldPlayBgSong} 
                                      handleMuteToggle={()=>{setShouldPlayBgSong(!shouldPlayBgSong)}} />

                    {/* button to change language */}
                    <LanguageChangeButton />
                </View>
            ),
        });
    }, [navigation, shouldPlayBgSong])

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
                                                    width={135} 
                                                    height={135} 
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

                                <View style={styles.flashcardContentTxtContainer}>
                                    {/* the flashcard's content text, make the text selectable 
                                        so users can copy link */}
                                    <Text style={styles.flashcardContentTxt} 
                                          selectable={true}>
                                        { isShowingAns == false ? 
                                                (
                                                    currentLang  == 'id' ?
                                                    deckArr[0]?.front_idn : 
                                                    deckArr[0]?.front
                                                ) : 
                                                (
                                                    currentLang  == 'id' ?
                                                    deckArr[0]?.back_idn : 
                                                    deckArr[0]?.back
                                                )
                                        }
                                    </Text>

                                    
                                    {
                                       (isShowingAns == true && deckArr[0]?.reference?.length > 0) &&
                                        <View style={styles.referencesSection}>
                                            {/* references section heading */}
                                            <Text style={styles.referenceHeadingTxt}>
                                                {t('shared.references')}:
                                            </Text>
                
                                            {/* the references */}
                                            {
                                                deckArr[0]?.reference?.map((item, index) => (
                                                    item.index && (
                                                    <View key={index} style={styles.citationContainer}>
                                                        <Text style={styles.indexTxt}>
                                                            [{item.index}]
                                                        </Text>
                                                        {/* make the citation texts selectable, so users can 
                                                            easily copy it or the link */}
                                                        <Text style={styles.citationTxt} selectable={true}>
                                                            {item?.text_part_1}
                                                            <Text style={[styles.citationTxt, styles.citationTxtItalic]} selectable={true}>
                                                                {item?.italic_text}
                                                            </Text>
                                                            {item?.text_part_2}
                                                        </Text>
                                                    </View>
                                                )))
                                            }
                                        </View>
                                    }
                                </View>

                                {/* show disclaimer text when showing answer */}
                                {
                                    isShowingAns == true && (
                                        <View style={styles.disclaimerContainer}>
                                            <Text style={styles.disclaimerTxt}>
                                                {t('flashcardScreen.disclaimer')}
                                            </Text>
                                        </View>
                                    )
                                }

                                {/* SM-2 attribution text following requirements shown on 
                                    https://supermemopedia.com/wiki/Licensing_SuperMemo_Algorithm?__cf_chl_tk=elpcKHpx6jfSSo34cfrjTTBGziYDCdEAIBrgPQDaq.c-1781093381-1.0.1.1-bXfY9SDKYXCChrbYv59xRgzJW..W7FcfhJZep4Cm5Fk */}
                                <View style={styles.algAttrTxtsContainer}>
                                    <Text style={styles.algAttributionTxt}>
                                        Algorithm SM-2, (C) Copyright SuperMemo World, 1991. 
                                    </Text>

                                     <Text onPress={() => {Linking.openURL('https://www.supermemo.com')}}
                                           style={styles.algAttributionTxtLinks}
                                           accessibilityRole='link'>
                                        https://www.supermemo.com 
                                    </Text>

                                    <Text onPress={() => {Linking.openURL('https://www.supermemo.eu')}}
                                          style={styles.algAttributionTxtLinks}
                                          accessibilityRole='link'>
                                        https://www.supermemo.eu
                                    </Text>
                                </View>
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
                                                                      onPress={()=>{handleEaseValButtonPress(deckArr[0].card_repetition, 
                                                                                                             deckArr[0].card_interval, 
                                                                                                             deckArr[0].card_ease_factor,
                                                                                                             item)}}>
                                                        <Text style={styles.flashcardEaseValBtnTxt}>
                                                            {item}
                                                        </Text>
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
            {/* loading overlay to show when isLoading is true */}
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
        columnGap: 20,
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white',
        borderRadius: 30
    },
    // explanation text about connection to avatar
    avatarExplanationTxt: {
        flex: 1,
        fontSize: 16,
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
        fontSize: 16
    },
    // flashcard content text
    flashcardContentTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    // container oof flashcard content text
    flashcardContentTxtContainer: {
        borderWidth: 2,
        borderRadius: 20,
        width: '100%',
        padding: 15,
        elevation: 3,
        marginVertical: 20,
        backgroundColor: '#2D3782',
        borderColor: '#D2DAE4',
        elevation: 5,
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20
    },
    // container of SM-2 attributions texts
    algAttrTxtsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        rowGap: 3
    },
    // SM-2 attribution text
    algAttributionTxt: {
        color: '#2D3782',
        fontSize: 15,
    },
    // SM-2 attribution text links
    algAttributionTxtLinks: {
        color: 'dodgerblue',
        textDecorationLine: 'underline',
        fontSize: 15
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
        backgroundColor: 'white',
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
        fontSize: 16,
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
    },
    // container of disclaimer text
    disclaimerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#white',
        borderRadius: 20,
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2D3782'
    },
    // the disclaimer text
    disclaimerTxt: {
        fontSize: 16,
        color: '#2D3782'
    },
    // references heading
    referenceHeadingTxt: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600'
    },
     // citation text
    citationTxt: {
        color: 'white',
        fontSize: 16,
        flex: 1,
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: 250,
        textAlign: 'left'
    },
    // index text for citation
    indexTxt: {
        textAlign: 'left',
        color: 'white',
        fontSize: 16
    },
    // container of citation
    citationContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        columnGap: 12
    },
    // references section
    referencesSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 13,
        flex: 1,
        flexWrap: 'wrap'
    },
    // itaic text for citation
    citationTxtItalic: {
        fontStyle: 'italic'
    },
    headerBtnsContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20
    }
});
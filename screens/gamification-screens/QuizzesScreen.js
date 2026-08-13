import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { showErrorToast } from '../../utils/show-toast';
import { useAudioPlayer } from 'expo-audio';
import { QuizAnswerResultOverlay } from '../../components/QuizAnswerResultOverlay';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { roundTo2DP } from '../../utils/rounding';
const correctAnsSoundSource = require('../../assets/audio/correct-answer-sound/538147__fupicat__correct-bell.wav');
const wrongAnsSoundSource = require('../../assets/audio/wrong-answer-sound/648462__andreas__wrong-answer.mp3');

export function QuizzesScreen() {
    const { t, i18n } = useTranslation();
    const { user } = useContext(AuthContext);
    const [availableCatergories, setAvailableCategories] = useState([]);
    const [chosenCategory, setChosenCategory] = useState(null);
    const [quizQuestionsAndAnswers, setQuizQuestionsAndAnswers] = useState([]);
    const [shouldShowCorrectAnsOverlay, setShouldShowCorrectAnsOverlay] = useState(false);
    const [shouldShowWrongAnsOverlay, setShouldShowWrongAnsOverlay] = useState(false);
    const [score, setScore] = useState(0);
    const [numberOfQuestionsShown, setNumberOfQuestionsShown] = useState(1);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [quizIsFinished, setQuizIsFinished] = useState(false);
    const currentLang = i18n.resolvedLanguage;
    const correctAnsPlayer = useAudioPlayer(correctAnsSoundSource);
    const wrongAnsPlayer = useAudioPlayer(wrongAnsSoundSource);
    const insets = useSafeAreaInsets();
    
    useEffect(()=>{
        // fetch all quiz categories
        const getCategories = async () => {
           setIsLoading(true);

           try{
            const { data, error } = await supabase.schema('gamification')
                                                  .from('quiz_categories')
                                                  .select();

            if(error){
                throw error;
            }
            else{
                if(data){
                    setAvailableCategories(data);
                }
            }
           }
           catch(error){
                showErrorToast(t('quizScreen.failedToFetchCategories'), 
                               `${error.message ?? JSON.stringify(error)}`);
           };

           setIsLoading(false);
        };

        getCategories();
       
    }, []);

    useEffect(()=>{
        // fetch questions and answers for the chosen category
        const getQuestionsAndAnswersForCategory = async(category) => {
            setIsLoading(true);

            try{
                const {data, error} = await supabase.schema('gamification')
                                                    .from('quiz_questions')
                                                    .select(`*, quiz_answers(*)`)
                                                    .eq('category', category);

                if(error){
                    throw error;
                }
                else{
                    if(data){
                        console.log(data);
                        setQuizQuestionsAndAnswers(data);
                        setNumberOfQuestions(data.length);
                    }
                };
            }
            catch(error){
                showErrorToast(t('quizScreen.failedToFetchQsAndAs'), 
                               `${error.message ?? JSON.stringify(error)}`);
            };

            setIsLoading(false);
        };

        if(chosenCategory){
            getQuestionsAndAnswersForCategory(chosenCategory);
        };
    }, [chosenCategory]);

    // function to handle answer button press
    const handleAnsBtnPress = async(correctAnsWasPicked) => {
        let newScore;

        // update number of questions shown
        const newNumberOfQsShown = numberOfQuestionsShown + 1;
        setNumberOfQuestionsShown(newNumberOfQsShown);

        // if the answer picked is true:
        if(correctAnsWasPicked == true){
          // add score
          newScore = score + (100/numberOfQuestions);
          setScore(newScore);

          // show correct answer overlay
          setShouldShowCorrectAnsOverlay(true);

          // play correct answer sound effect
          correctAnsPlayer.seekTo(0);
          correctAnsPlayer.play();
        }
        // if the answer picked is false
        else{
            /// show wrong answer overlay
            setShouldShowWrongAnsOverlay(true);

            // play wrong answer sound effect
            wrongAnsPlayer.seekTo(0);
            wrongAnsPlayer.play();
        }

        // new Q and A array with the first item removed
        const newQuestionsAndAnswersArr = quizQuestionsAndAnswers.filter((item, index) => index !== 0);

        // if there is no more questions to be shown afterwards, set quiz as finished
        if(newQuestionsAndAnswersArr.length == 0){
            setQuizIsFinished(true);

            // fetch user's XP and check if they've ever gotten 100 before
            const {data, error} = await supabase.schema('users')
                                                .from('profiles_public_data')
                                                .select('has_gotten_100_in_a_quiz, xp')
                                                .eq('user_id', user.id)
                                                .single();

            if(error){
                showErrorToast(t('quizScreen.failedToFetchProfileData'), 
                               `${error.message ?? JSON.stringify(error)}`);
            }
            else{
                let newXp = 0;

                if(newScore == 100){
                    newXp = 70;
                }
                else if(newScore < 100 && newScore >= 70){
                    newXp = 55
                }
                else if(newScore < 70){
                    newXp = 20
                };

                let error = null;

                // if user has never gotten 100 before, update that and the xp
                if(data?.has_gotten_100_in_a_quiz == false){
                    const res = await supabase.schema('users')
                                              .from('profiles_public_data')
                                              .update({ has_gotten_100_in_a_quiz: true, 
                                                        xp: data?.xp + newXp })
                                              .eq('user_id', user.id);

                    error = res?.error;
                }
                // otherwise just update the xp
                else{
                    const res = await supabase.schema('users')
                                          .from('profiles_public_data')
                                          .update({ xp: data?.xp + newXp })
                                          .eq('user_id', user.id);

                    error = res?.error;
                }

                if(error){
                    showErrorToast(t('quizScreen.failedToUpdateProfile'), 
                                    `${error.message ?? JSON.stringify(error)}`);
                }
            }
        }
        // update the corresponding state with the new array
        setQuizQuestionsAndAnswers(newQuestionsAndAnswersArr);
    };

    // show correct answer overlay only for 2 seconds
    useEffect(()=>{
        if (shouldShowCorrectAnsOverlay == true) {
            const timerRef = setTimeout(() => {
                setShouldShowCorrectAnsOverlay(false);
                clearTimeout(timerRef);
            }, 2000);
        }
    }, [shouldShowCorrectAnsOverlay]);

    // show wrong answer overlay only for 2 seconds
    useEffect(()=>{
        if (shouldShowWrongAnsOverlay == true) {
            const timerRef = setTimeout(() => {
                setShouldShowWrongAnsOverlay(false);
                clearTimeout(timerRef);
            }, 2000);
        }
    }, [shouldShowWrongAnsOverlay]);

    // handle going back to category menu after quiz is completed
    const handleGoBackToMenuBtnPress = () => {
        setScore(0);
        setNumberOfQuestionsShown(0);
        setChosenCategory(null);
    };

    return(
        <View style={[styles.screenContainer, {paddingLeft: insets.left, 
                                               paddingRight: insets.right,
                                               paddingBottom: insets.bottom + 70}]}>
            {
                chosenCategory ? (
                    <ScrollView contentContainerStyle={styles.quizContent}>
                        {
                            quizQuestionsAndAnswers.length > 0 ? 
                            (
                                // if there is a question to show, show the ongoing quiz content
                                <View style={styles.headingAndQuestionAnswersContainer}>
                                    <View style={styles.headingTxtsContainer}>
                                        <Text style={styles.quizHeadingTxt}>
                                            {t('quizScreen.question')} {numberOfQuestionsShown}/{numberOfQuestions}
                                        </Text>

                                        <Text style={styles.quizHeadingTxt}>
                                            {t('quizScreen.score')}: {roundTo2DP(score)}
                                        </Text>
                                    </View>

                                    <View style={styles.questionAndAnswersContainer}>
                                        <Text style={styles.questionTxt}>
                                            {currentLang == 'id' ? 
                                            quizQuestionsAndAnswers[0].question_text_idn :
                                            quizQuestionsAndAnswers[0].question_text}
                                        </Text>
                                
                                        {
                                            quizQuestionsAndAnswers[0].quiz_answers.map((item, index) => {
                                                return(
                                                    <TouchableOpacity key={index}
                                                                    onPress={()=>{handleAnsBtnPress(item.is_correct_ans)}}
                                                                    style={styles.answerBtn}>
                                                        <Text style={styles.answerBtnTxt}>
                                                            {currentLang == 'id' ? 
                                                            item.answer_text_idn :
                                                            item.answer_text}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            ) :
                            // if there's no more question to show and quiz is finished, show the final results
                            quizIsFinished && (
                                <View style={styles.quizEndContent}>
                                    {/* text saying 'Quiz Completed' */}
                                    <Text style={styles.quizCompletedTxt}>
                                        {t('quizScreen.quizCompleted')} 🎉
                                    </Text>

                                    {/* final score text */}
                                    <Text style={styles.finalScoreTxt}>
                                        {t('quizScreen.finalScore')}: {roundTo2DP(score)}
                                    </Text>

                                    {/* button to go back to categories menu */}
                                    <TouchableOpacity onPress={()=>{handleGoBackToMenuBtnPress()}}
                                                      style={styles.goBackToCategoriesBtn}>
                                        <Text style={styles.goBackToCategoriesBtnTxt}>
                                            {t('quizScreen.goBackToCategoriesMenu')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </ScrollView>
                ):
                (
                    // menu for picking quiz category
                    <View style={styles.pickCategoryMenu}>
                        {/* 'Please pick a category' text */}
                        <Text style={styles.pickCategoryTxt}>
                            {t('quizScreen.pleasePickACategory')}
                        </Text>

                        {/* category buttons */}
                        <View style={styles.categoryBtnsContainer}>
                            {
                                availableCatergories && (
                                    availableCatergories.map((item, index) => {
                                        return(
                                            <TouchableOpacity style={styles.categoryBtn} 
                                                              key={index}
                                                              onPress={()=>{setChosenCategory(item.category_id)}}>
                                                <Text style={styles.categoryBtnTxt}>
                                                    {currentLang  == 'id' ? 
                                                     item.category_name_idn : 
                                                     item.category_name}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                )
                            }
                        </View>
                    </View>
                )
            }

            {/* correct answer overlay, shown when correct answer was picked */}
            {
                shouldShowCorrectAnsOverlay && (
                    <QuizAnswerResultOverlay correct={true} />
                )
            }

            {/* wrong answer overlay, showon when wrong answer was picked */}
            {
                shouldShowWrongAnsOverlay && (
                    <QuizAnswerResultOverlay correct={false} />
                )
            }

            {/* loading overlay shown when isLoading is true */}
            {
                isLoading && (
                    <LoadingOverlay />
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    // container of whole screen
    screenContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white'
    },
    // container of quiz menu
    pickCategoryMenu: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 20
    },
    // category buttons container on quiz menu
    categoryBtnsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 20,
        padding: 30,
        width: '70%',
        maxWidth: 350,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white',
        borderRadius: 30
    },
    /* button for each catergory option 
       button on quiz menu */
    categoryBtn: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D3782',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 50
    },
    /* text inside button for each category 
       option button on quiz menu */
    categoryBtnTxt: {
        color: 'white',
        fontWeight: '600'
    },
    // text saying 'Please pick a category
    pickCategoryTxt: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3782'
    },
    // scroll view of quiz content
    quizContentScrollView: {
        width: '100%',
        height: '100%'
    },
    // quiz content shown when category is chosen
    quizContent: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: 30
    },
    /* container of heading texts and the view 
       containing quiz question and answers */
    headingAndQuestionAnswersContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        rowGap: 35,
        width: '100%'
    },
    // container of heading texts shown on ongoing quiz
    headingTxtsContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    // text on ongoing quiz heading
    quizHeadingTxt: {
        fontSize: 15,
        color: '#2D3782',
        textAlign: 'center',
        fontWeight: '600'
    },
    // container of the quiz question and its answers
    questionAndAnswersContainer: {
        display: 'flex',
        alignItems: 'center',
        rowGap: 30,
        width: '100%'
    },
    // text showing question
    questionTxt: {
        fontSize: 17,
        color: '#2D3782',
        fontWeight: '600',
        textAlign: 'center'
    },
    // button for picking answer
    answerBtn: {
        backgroundColor: '#2D3782',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    // text inside answer button
    answerBtnTxt: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center'
    },
    // content shown when quiz is completed
    quizEndContent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        rowGap: 20
    },
    // text saying 'Quiz Completed'
    quizCompletedTxt: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3782'
    },
    // text showing final score
    finalScoreTxt: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3782'
    },
    // button to go back to categories menu
    goBackToCategoriesBtn: {
        backgroundColor: '#2D3782',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // text inside button to go back to categories menu
    goBackToCategoriesBtnTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});
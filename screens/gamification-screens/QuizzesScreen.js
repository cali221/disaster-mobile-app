import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { showErrorToast } from '../../utils/show-toast';
import { useAudioPlayer } from 'expo-audio';

const correctAnsSoundSource = require('../../assets/audio/correct-answer-sound/538147__fupicat__correct-bell.wav');
const wrongAnsSoundSource = require('../../assets/audio/wrong-answer-sound/648462__andreas__wrong-answer.mp3');

export function QuizzesScreen() {
    const { t, i18n } = useTranslation();
    const [availableCatergories, setAvailableCategories] = useState([]);
    const [chosenCategory, setChosenCategory] = useState(null);
    const [quizQuestionsAndAnswers, setQuizQuestionsAndAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const currentLang = i18n.resolvedLanguage;
    const correctAnsPlayer = useAudioPlayer(correctAnsSoundSource);
    const wrongAnsPlayer = useAudioPlayer(wrongAnsSoundSource);
    

    useEffect(()=>{
        // fetch all quiz categories
        const getCategories = async () => {
           try{
            const { data, error } = await supabase.schema('gamification')
                                                  .from('quiz_categories')
                                                  .select();

            if(error){
                throw error;
            }
            else{
                if(data){
                    console.log(data);
                    setAvailableCategories(data);
                }
            }
           }
           catch(error){
                showErrorToast('Failed to fetch quiz categories', 
                               `${error.message ?? JSON.stringify(error)}`);
           }
        };

        getCategories();
       
    }, []);

    useEffect(()=>{
        // fetch questions and answers for the chosen category
        const getQuestionsAndAnswersForCategory = async(category) => {
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
                    }
                };
            }
            catch(error){
                showErrorToast('Failed to fetch question and answers data', 
                               `${error.message ?? JSON.stringify(error)}`);
            };
        };

        if(chosenCategory){
            getQuestionsAndAnswersForCategory(chosenCategory);
        };
    }, [chosenCategory]);

    const handleAnsBtnPress = (correctAnsWasPicked) => {
        if(correctAnsWasPicked == true){
          correctAnsPlayer.seekTo(0);
          correctAnsPlayer.play();
        }
        else{
            wrongAnsPlayer.seekTo(0);
            wrongAnsPlayer.play();
        }

        // new Q and A array with the first item removed
        const newQuestionsAndAnswersArr = quizQuestionsAndAnswers.filter((item, index) => index !== 0);

        // update the corresponding state with the new array
        setQuizQuestionsAndAnswers(newQuestionsAndAnswersArr);
    };

    return(
        <View style={styles.screenContainer}>
            {
                chosenCategory ? (
                    <View>
                        {
                            quizQuestionsAndAnswers.length > 0 ? 
                            (
                                <View>
                                    <Text>
                                        {currentLang == 'id' ? 
                                         quizQuestionsAndAnswers[0].question_text_idn :
                                         quizQuestionsAndAnswers[0].question_text}
                                    </Text>

                                    {
                                        quizQuestionsAndAnswers[0].quiz_answers.map((item, index) => {
                                            return(
                                                <TouchableOpacity key={index}
                                                                  onPress={()=>{handleAnsBtnPress(item.is_correct_ans)}}>
                                                    <Text>
                                                        {currentLang == 'id' ? 
                                                         item.answer_text_idn :
                                                         item.answer_text}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            ) :
                            (
                                <View>
                                    <Text>
                                        FINISHED
                                    </Text>
                                </View>
                            )
                        }
                    </View>
                ):
                (
                    <View style={styles.pickCategoryMenu}>
                        <Text>
                            {t('quizScreen.pleasePickACategory')}
                        </Text>
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
    }
});
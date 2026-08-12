import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export function QuizAnswerResultOverlay(props){
    const { t, i18n } = useTranslation();

    return(
        <View style={styles.answerResultOverlay}>
            {/* checkmark emoji if correct answer, otherwise red cross emoji */}
            <Text style={styles.emoji}>
                 {
                    props.correct == true ? '✅':
                                            '❌'
                }
            </Text>

            {/* text showing correct/wrong accordingly */}
            <Text style={styles.resultText}>
                {
                    props.correct == true ? t('quizAnswerOverlay.correct'):
                                            t('quizAnswerOverlay.wrong')
                }
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    // the overlay background
    answerResultOverlay: {
        position: 'absolute',
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: '#2D3782',
        zIndex: 100,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flex: 1
    },
    // the checkmark/red cross emoji
    emoji: {
        fontSize: 50
    },
    // the correct/wrong text
    resultText: {
        fontSize: 25,
        fontWeight: '600',
        color: 'white'
    }
})
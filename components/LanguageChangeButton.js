/**
 * Button on header to switch language
 */
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { showErrorToast } from '../utils/show-toast';
import { useTranslation } from 'react-i18next';

export function LanguageChangeButton() {
    const { t, i18n } = useTranslation();
    const { currentLang, handleLangChange } = useContext(LanguageContext);

    const changeLang = (langCode) => {
        try{
            handleLangChange(langCode);
        }
        catch(error){
            showErrorToast(t('shared.failedToChangeLang'), 
                           `${error.message ?? JSON.stringify(error)}`);
        }
    };

    return (
        <TouchableOpacity onPress={()=>{currentLang == 'id' ? 
                                        changeLang('en') : 
                                        currentLang == 'en' && 
                                        changeLang('id')}}
                          style={styles.langChangeBtn}>
            {/* the language code text */}
            <Text style={styles.langCodeTxt}>
                {t('shared.changeLanguageTo')} {currentLang == 'en' ? 'ID' : 'EN'}
            </Text>
        </TouchableOpacity>
    )
}
    
const styles = StyleSheet.create({
    // the language code text
    langCodeTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline'
    },
    // the container/button of the language code text
    langChangeBtn: {
        marginRight: 25
    }
});
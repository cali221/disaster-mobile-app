import { View, StyleSheet, Text } from 'react-native';
import { Skull, 
         Smile, 
         Frown, 
         Meh} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function SeverityIconAndLabel(props) {
    const { t, i18n } = useTranslation();

    let severityIconAndLabel;

    if(props.severityValue == 0){
        severityIconAndLabel = 
        <View style={styles.iconAndLabelContainer}>
            <Smile size={props?.iconSize ? props.iconSize : 55} 
                         stroke={props?.iconStrokeColor ? props.iconStrokeColor: '#2D3782'}
                         fill={props?.iconFillColor ? props.iconFillColor : 'transparent'} />

            <Text style={styles.severityTxt}>
                {t('severityLabels.didntFeelOrSee')}
            </Text>
        </View>

    }
    else if(props.severityValue == 1){
       severityIconAndLabel = 
       <View style={styles.iconAndLabelContainer}>
            <Meh size={props?.iconSize ? props.iconSize : 55} 
                 stroke={props?.iconStrokeColor ? props.iconStrokeColor: '#2D3782'}
                 fill={props?.iconFillColor ? props.iconFillColor : 'transparent'} />

            <Text style={styles.severityTxt}>
                {t('severityLabels.notThatBad')}
            </Text>
       </View>
    }
    else if(props.severityValue == 2){
        severityIconAndLabel = 
        <View style={styles.iconAndLabelContainer}>
            <Frown size={props?.iconSize ? props.iconSize : 55} 
                   stroke={props?.iconStrokeColor ? props.iconStrokeColor: '#2D3782'}
                   fill={props?.iconFillColor ? props.iconFillColor : 'transparent'} />

            <Text style={styles.severityTxt}>
                {t('severityLabels.bad')}
            </Text>
        </View>
    }
    else if(props.severityValue == 3){
        severityIconAndLabel = 
        <View style={styles.iconAndLabelContainer}>
            <Skull size={props?.iconSize ? props.iconSize : 55} 
                   stroke={props?.iconStrokeColor ? props.iconStrokeColor: '#2D3782'}
                   fill={props?.iconFillColor ? props.iconFillColor : 'transparent'} />

            <Text style={styles.severityTxt}>
                {t('severityLabels.veryBad')}
            </Text>
        </View>
    }
    
    return severityIconAndLabel;
    
}

const styles = StyleSheet.create({
    // container of severity icon and label
    iconAndLabelContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        width: 80
    },
    // text under severity icon
    severityTxt: {
        fontSize: 16,
        textAlign: 'center',
        width: '100%',
        color: '#2D3782'
    },
})
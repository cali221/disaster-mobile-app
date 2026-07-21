import Toast from 'react-native-toast-message';
import { AccessibilityInfo } from 'react-native';

// function for showing success toast
export function showSuccessToast(text1, text2) {
    Toast.show({
        type: 'customSuccessToast',
        text1: text1,
        text2: text2,
        onShow: ()=>{AccessibilityInfo.announceForAccessibility(`${text1}. ${text2}`)}
    });
}

// function for showing info toast
export function showInfoToast(text1, text2) {
    Toast.show({
        type: 'customInfoToast',
        text1: text1,
        text2: text2,
        onShow: ()=>{AccessibilityInfo.announceForAccessibility(`${text1}. ${text2}`)}
    });
}

// function for showing error toast
export function showErrorToast(text1, text2) {
    Toast.show({
        type: 'customErrorToast',
        text1: text1,
        text2: text2,
        onShow: ()=>{AccessibilityInfo.announceForAccessibility(`${text1}. ${text2}`)}
    });
}
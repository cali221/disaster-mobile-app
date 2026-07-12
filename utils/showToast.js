import Toast from 'react-native-toast-message';

export function showSuccessToast(text1, text2) {
    Toast.show({
        type: 'customSuccessToast',
        text1: text1,
        text2: text2
    });
}

export function showInfoToast(text1, text2) {
    Toast.show({
        type: 'customInfoToast',
        text1: text1,
        text2: text2
    });
}

export function showErrorToast(text1, text2) {
    Toast.show({
        type: 'customErrorToast',
        text1: text1,
        text2: text2
    });
}
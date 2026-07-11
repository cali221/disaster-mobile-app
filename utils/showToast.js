import Toast from 'react-native-toast-message';

export function showSuccessToast(text1, text2) {
    Toast.show({
        type: 'success',
        text1: text1,
        text2: text2
    });
}

export function showInfoToast(text1, text2) {
    Toast.show({
        type: 'info',
        text1: text1,
        text2: text2
    });
}

export function showErrorToast(text1, text2) {
    Toast.show({
        type: 'error',
        text1: text1,
        text2: text2
    });
}
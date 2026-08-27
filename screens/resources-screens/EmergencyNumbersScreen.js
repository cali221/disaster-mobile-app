import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';

export function EmergencyNumbersScreen() {
    const emergencyNumbers = [{name: 'Emergency', nameIdn: 'Darurat',phoneNum: '112'},
                              {name: 'Search and Rescue', nameIdn: 'SAR/BASARNAS', phoneNum: '115'},
                              {name: 'Ambulance (option 1)', nameIdn: 'Ambulans (opsi 1)', 'phoneNum': '118'},
                              {name: 'Ambulance (option 2)', nameIdn: 'Ambulans (opsi 2)', 'phoneNum': '119'},
                              {name: 'Police', nameIdn: 'Polisi', phoneNum: '110'},
                              {name: 'Firefighter', nameIdn: 'Pemadam Kebakaran',  phoneNum: '113'},
                              {name: 'Natural Disaster Command Post', nameIdn: 'Posko Bencana Alam', phoneNum: '129'},
                              {name: 'Call Center BNPB', nameIdn: 'Call Center BNPB', phoneNum: '117'},
                              {name: 'PLN (Perusahaan Listrik Negara)', nameIdn: 'PLN (Perusahaan Listrik Negara)', phoneNum: '123'},
                              {name: 'National Commission on Violence Against Women (Komnas Perempuan)', nameIdn: 'Komisi Nasional Anti Kekerasan terhadap Perempuan (Komnas Perempuan)', phoneNum: '021-3903963'},
                              {name: 'National Commission on Human Rights (Komnas HAM)', nameIdn: 'Komisi Nasional Hak Asasi Manusia (Komnas HAM)', phoneNum: '021-3925230'},
                              {name: 'Indonesian Child Protection Commission (KPAI)', nameIdn: 'Komisi Perlindungan Anak Indonesia (KPAI)', phoneNum: '021-31901556'}];
    return(
        <View style={styles.screenContainer}>
            <Text>Emergency Numbers Screen Placeholder</Text>

            <ScrollView style={styles.screenScrollView}>

            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    screenScrollView: {
        width: '100%'
    },
    screenScrollViewContentContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }
});

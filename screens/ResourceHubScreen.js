import { Text, 
         View, 
         StyleSheet, 
         ScrollView, 
         TouchableOpacity } from 'react-native';
import { Activity,
         Waves,
         Mountain,
         WavesArrowUp,
         SlashIcon,
         Phone,
         Map } from 'lucide-react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export function ResourceHubScreen({navigation}){
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    return(
        <View style={[styles.screenContainer, 
                      {paddingLeft: insets.left, 
                       paddingRight: insets.right}]}>
            <ScrollView contentContainerStyle={[styles.screenScrollViewContent, 
                                                {paddingTop: insets.top, 
                                                 paddingBottom: insets.bottom + 30}]}>
                {/* emergency number button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      onPress={()=>{navigation.navigate('Emergency Numbers')}}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToEmergencyNumbersScreen')}>
                        <Phone size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.emergencyNumbers')}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {/* useful location button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToUsefulLocationScreen')}
                                      onPress={()=>{navigation.navigate('Useful Locations')}}>
                        <Map size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.usefulLocations')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* earthquake guide button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToEarthquakeGuideScreen')}
                                      onPress={()=>{navigation.navigate('Earthquake Guide')}}>
                        <Activity size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.earthquakeGuide')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* tsunami guide button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToTsunamiGuideScreen')}
                                      onPress={()=>{navigation.navigate('Tsunami Guide')}}>
                        <WavesArrowUp size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.tsunamiGuide')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* flood guide button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToFloodGuideScreen')}
                                      onPress={()=>{navigation.navigate('Flood Guide')}}>
                        <Waves size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.floodGuide')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* landslide guide button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToLandslideGuideScreen')}
                                      onPress={()=>{navigation.navigate('Landslide Guide')}}>
                        <SlashIcon size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.landslideGuide')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* volcanic eruption guide button */}
                <View style={styles.menuBtnContainer}>
                    <TouchableOpacity style={styles.menuBtn}
                                      accessibilityRole='button'
                                      accessibilityLabel={t('resourceHubScreen.goToVolcanicEruptionGuideScreen')}
                                      onPress={()=>{navigation.navigate('Volcanic Eruption Guide')}}>
                        <Mountain size={45} stroke={'white'} />

                        <Text style={styles.menuBtnTxt}>
                            {t('resourceHubScreen.volcanicEruptionGuide')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    // container of the whole screen
    screenContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },
    // content container of the screen's scroll view
    screenScrollViewContent: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    // container of each menu button
    menuBtnContainer: {
        flexBasis: '50%', 
        width: '50%',
        padding: 20, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    // menu button
    menuBtn: {
        backgroundColor: '#2D3782', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column', 
        rowGap: 10, 
        padding: 22, 
        width: '100%', 
        height: 150,
        maxWidth: 150, 
        borderRadius: 20, 
        elevation: 3
    },
    // text inside menu button
    menuBtnTxt: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: 'white'
    }
});

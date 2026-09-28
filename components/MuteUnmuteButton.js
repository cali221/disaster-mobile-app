/**
 * Button on the header of flashcards screen to mute/unmute background music
 */

import { TouchableOpacity, StyleSheet } from 'react-native';
import { VolumeOff, Volume2 } from 'lucide-react-native';
import { t } from 'i18next';

export function MuteUnmuteButton(props) {
    return (
        <TouchableOpacity onPress={()=>{props?.handleMuteToggle()}}
                          style={styles.muteBtn}
                          accessibilityLabel={props?.isMuted == true ? 
                                              t('flashcardsScreen.unmuteBackgroundSong'): 
                                              t('flashcardsScreen.muteBackgroundSong')}>
            {
                props?.isMuted == true ?
                (
                    <Volume2 size={25} color={'white'} />
                ):
                (
                    <VolumeOff size={25} color={'white'} />
                )
            }
        </TouchableOpacity>
    )
}
    
const styles = StyleSheet.create({
    muteBtn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
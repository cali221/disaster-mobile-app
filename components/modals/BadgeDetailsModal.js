import { Text, View, StyleSheet, Image } from 'react-native';
import { CenterModalBase } from '../modals-base/CenterModalBase';

export function BadgeDetailsModal(props) {
    return(
       <CenterModalBase title={props.badgeModalData.name} 
                        closeFunc={()=>{props.hideBadgeModalFunc()}}>
            <View style={styles.badgeModalContentContainer}>
                {/* the badge's image */}
                <Image source={{uri: props.badgeModalData.badgeImgUrl}} 
                                style={[styles.badgeModalImg, 
                                        props.badgeModalData.earned == false && {filter: 'grayscale(100%)'}]}/>
                {/* the badge's description */}
                <Text style={styles.badgeModalDescTxt}>
                    {props.badgeModalData.badgeDesc}
                </Text>
            </View>
        </CenterModalBase>
    )
};

const styles = StyleSheet.create({
    // content/body container of badge modal
    badgeModalContentContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%'
    },
    // modal image shown on badge modal
    badgeModalImg: {
        width: 170,
        height: 170
    },
    // description text shown on badge modal
    badgeModalDescTxt: {
        fontSize: 16,
        color: '#2D3782',
        textAlign: 'center'
    }
});